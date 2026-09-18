# PatentlyAI 🚀

> **AI Patent Availability Checker & Scientific Research Paper Finder**

🔗 **Live Application:** [https://patentlyai-project.vercel.app](https://patentlyai-project.vercel.app)

---

## 📌 Overview
**PatentlyAI** is an intelligent prior-art discovery platform designed for researchers, patent attorneys, and inventors. It screens novel invention descriptions against patent databases using machine learning and searches global peer-reviewed scientific literature in real time.

## ✨ Key Features
* **AI Patent Similarity Screener:** Analyzes user invention titles, descriptions, and technical keywords using **TF-IDF vectorization** and **Cosine Similarity** to assign risk tiers (*Low*, *Moderate*, *High*, *Very High*).
* **Live Research Paper Finder:** Direct integration with the **OpenAlex API** to discover published academic papers with strict publication-year range filtering.
* **Abstract Reconstruction:** Automatically reconstructs abstracts from inverted index catalogs.
* **Portfolio & Audit Trail:** Bookmark relevant patents and publications, export them to BibTeX or JSON, and view previous screening history.

## 🛠️ Tech Stack
* **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
* **Backend:** Python, Flask, Flask-CORS, SQLAlchemy
* **Machine Learning:** Scikit-learn (TF-IDF Vectorizer, Cosine Similarity), NumPy
* **Data Sources:** OpenAlex Academic API, Patent Prior-Art Repositories
* **Deployment:** Vercel (Frontend), GitHub CI/CD

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py

### 2. Fronted Setup
cd frontend
npm install
npm run dev

http://localhost:5173/
