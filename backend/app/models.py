from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    organization = db.Column(db.String(150), default='Independent Research')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    query = db.Column(db.Text, nullable=False)
    search_type = db.Column(db.String(50), nullable=False)  # 'patent' or 'paper'
    results_count = db.Column(db.Integer, default=0)
    top_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SavedItem(db.Model):
    __tablename__ = 'saved_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    item_type = db.Column(db.String(20), nullable=False)    # 'patent' or 'paper'
    item_id = db.Column(db.String(100), nullable=False)
    title = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(100))
    url = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)