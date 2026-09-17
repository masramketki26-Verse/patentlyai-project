import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from . import db
from .models import User, SearchHistory, SavedItem
from .ml_engine import compute_similarity
import requests

api = Blueprint('api', __name__, url_prefix='/api')

# Helper: Token Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.split(" ")[1] if " " in token else token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except Exception:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# 1. REGISTER
@api.route('/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 409

    # Set as admin if email contains 'admin'
    role = 'admin' if 'admin' in email else 'user'

    new_user = User(name=name, email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role,
            'organization': new_user.organization,
            'created_at': new_user.created_at.strftime('%Y-%m-%d')
        }
    }), 201

# 2. LOGIN
@api.route('/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'organization': user.organization,
            'created_at': user.created_at.strftime('%Y-%m-%d')
        }
    })

# 3. GET / UPDATE PROFILE
@api.route('/profile', methods=['GET', 'PUT'])
@token_required
def user_profile(current_user):
    if request.method == 'PUT':
        data = request.json or {}
        current_user.name = data.get('name', current_user.name)
        current_user.organization = data.get('organization', current_user.organization)
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})

    total_searches = SearchHistory.query.filter_by(user_id=current_user.id).count()
    total_saved = SavedItem.query.filter_by(user_id=current_user.id).count()

    return jsonify({
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'role': current_user.role,
            'organization': current_user.organization,
            'created_at': current_user.created_at.strftime('%Y-%m-%d'),
            'total_searches': total_searches,
            'total_saved': total_saved
        }
    })

# 4. ADMIN DASHBOARD & TELEMETRY
@api.route('/admin/stats', methods=['GET'])
@token_required
def admin_stats(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    total_searches = SearchHistory.query.count()
    patent_searches = SearchHistory.query.filter_by(search_type='patent').count()
    paper_searches = SearchHistory.query.filter_by(search_type='paper').count()

    return jsonify({
        'total_users': len(users),
        'total_searches': total_searches,
        'patent_searches': patent_searches,
        'paper_searches': paper_searches,
        'users_list': [{
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'joined': u.created_at.strftime('%Y-%m-%d')
        } for u in users]
    })