import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS = {
    'a','an','the','and','or','in','on','at','to','for','of','with','by',
    'from','is','are','was','were','be','been','system','method','apparatus',
    'device','comprising','includes','characterized','said','wherein'
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = [w for w in text.split() if len(w) > 2 and w not in STOPWORDS]
    return " ".join(tokens)

def compute_similarity(query_text: str, target_documents: list[str]) -> list[float]:
    cleaned_query = clean_text(query_text)
    cleaned_docs = [clean_text(doc) for doc in target_documents]

    corpus = [cleaned_query] + cleaned_docs
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
    
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        return [float(s) for s in scores]
    except Exception:
        return [0.0] * len(target_documents)