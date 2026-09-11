\# 🍳 AI Chef



> Smart Recipe Recommendation Platform powered by Machine Learning



AI Chef is an AI-powered recipe recommendation platform that helps users discover recipes based on the ingredients they already have.



The application uses natural language preprocessing, TF-IDF vectorization, and cosine similarity to compare user-provided ingredients with a recipe dataset and recommend the most relevant recipes.



\---



\## ✨ Features



\- 🥘 Ingredient-based recipe recommendations

\- 🤖 Machine Learning-based recipe matching

\- 🎯 Match percentage for recommended recipes

\- 🎤 Voice-based ingredient input

\- 📖 Detailed recipe instructions

\- 🖼️ Recipe images

\- ❤️ Save favorite recipes

\- 📋 Copy recipe details

\- 📥 Download recipes as PDF

\- 🖼️ Upload and share cooked dishes

\- ⭐ 1–5 star ratings

\- ✍️ User text reviews

\- 💾 Browser-based persistence using localStorage

\- 📱 Responsive web interface



\---



\## 🧠 How It Works



The recommendation system follows this workflow:



```text

User Ingredients

&#x20;      ↓

Text Preprocessing

&#x20;      ↓

TF-IDF Vectorization

&#x20;      ↓

Cosine Similarity

&#x20;      ↓

Compare with Recipe Dataset

&#x20;      ↓

Rank Recipes

&#x20;      ↓

Top Recommended Recipes



\---



\## 🏗️ System Architecture



```text

&#x20;                ┌─────────────────────┐

&#x20;                │     React Frontend  │

&#x20;                │                     │

&#x20;                │ • Ingredient Input  │

&#x20;                │ • Voice Input       │

&#x20;                │ • Recipe UI         │

&#x20;                │ • Reviews \& Rating  │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                           │ HTTP API

&#x20;                           ↓

&#x20;                ┌─────────────────────┐

&#x20;                │    FastAPI Backend  │

&#x20;                │                     │

&#x20;                │ • Recommendation API│

&#x20;                │ • Image Detection   │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                           ↓

&#x20;                ┌─────────────────────┐

&#x20;                │ ML Recommendation   │

&#x20;                │                     │

&#x20;                │ TF-IDF + Cosine     │

&#x20;                │ Similarity           │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                           ↓

&#x20;                ┌─────────────────────┐

&#x20;                │    Recipe Dataset   │

&#x20;                │                     │

&#x20;                │     790 Recipes     │

&#x20;                └─────────────────────┘



🛠️ Tech Stack

Frontend

* React
* Vite
* JavaScript
* CSS
* jsPDF
* Web Speech API

Backend

* Python
* FastAPI
* Uvicorn

Machine Learning

* Pandas
* NumPy
* Scikit-learn
* TF-IDF Vectorization
* Cosine Similarity
* Natural Language Preprocessing

Data

* CSV-based recipe dataset
* 790 unique recipes
* Recipe images and instructions

Development Tools

* Git
* GitHub
* VS Code




