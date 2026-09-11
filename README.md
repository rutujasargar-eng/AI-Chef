\# 🍳 AI Chef



> \*\*Smart Recipe Recommendation Platform Powered by Machine Learning\*\*



AI Chef is an AI-powered recipe recommendation platform that helps users discover recipes based on the ingredients they already have.



The application uses \*\*Natural Language Preprocessing, TF-IDF Vectorization, and Cosine Similarity\*\* to compare user-provided ingredients with a recipe dataset and recommend the most relevant recipes.



\---



\## ✨ Features



\* 🥘 \*\*Ingredient-Based Recipe Recommendations\*\*

\* 🤖 \*\*Machine Learning-Based Recipe Matching\*\*

\* 🎯 \*\*Recipe Match Percentage\*\*

\* 🎤 \*\*Voice-Based Ingredient Input\*\*

\* 📖 \*\*Detailed Recipe Instructions\*\*

\* 🖼️ \*\*Recipe Images\*\*

\* ❤️ \*\*Save Favorite Recipes\*\*

\* 📋 \*\*Copy Recipe Details\*\*

\* 📥 \*\*Download Recipes as PDF\*\*

\* 🖼️ \*\*Upload and Share Cooked Dishes\*\*

\* ⭐ \*\*1–5 Star Ratings\*\*

\* ✍️ \*\*User Text Reviews\*\*

\* 💾 \*\*Browser-Based Data Persistence using localStorage\*\*

\* 📱 \*\*Responsive Web Interface\*\*



\---



\## 🧠 How It Works



The recommendation system follows a simple machine learning workflow:



```text

User Ingredients

&#x20;      ↓

Text Preprocessing

&#x20;      ↓

TF-IDF Vectorization

&#x20;      ↓

Cosine Similarity

&#x20;      ↓

Comparison with Recipe Dataset

&#x20;      ↓

Recipe Ranking

&#x20;      ↓

Top Recommended Recipes

```



The user's ingredient input is converted into numerical vectors using \*\*TF-IDF\*\*. The system then calculates \*\*Cosine Similarity\*\* between the user's ingredients and the recipes in the dataset. Recipes with higher similarity scores are ranked higher and recommended to the user.



\---



\## 🏗️ System Architecture



```text

&#x20;                ┌─────────────────────────┐

&#x20;                │      React Frontend     │

&#x20;                │                         │

&#x20;                │ • Ingredient Input      │

&#x20;                │ • Voice Input           │

&#x20;                │ • Recipe Interface      │

&#x20;                │ • Reviews \& Ratings     │

&#x20;                └────────────┬────────────┘

&#x20;                             │

&#x20;                             │ HTTP API

&#x20;                             ↓

&#x20;                ┌─────────────────────────┐

&#x20;                │     FastAPI Backend     │

&#x20;                │                         │

&#x20;                │ • Recommendation API   │

&#x20;                │ • Image Detection       │

&#x20;                └────────────┬────────────┘

&#x20;                             │

&#x20;                             ↓

&#x20;                ┌─────────────────────────┐

&#x20;                │ ML Recommendation       │

&#x20;                │ Engine                   │

&#x20;                │                         │

&#x20;                │ • TF-IDF                │

&#x20;                │ • Cosine Similarity     │

&#x20;                └────────────┬────────────┘

&#x20;                             │

&#x20;                             ↓

&#x20;                ┌─────────────────────────┐

&#x20;                │     Recipe Dataset      │

&#x20;                │                         │

&#x20;                │      790 Recipes        │

&#x20;                └─────────────────────────┘

```



\---



\## 🛠️ Tech Stack



\### Frontend



\* React

\* Vite

\* JavaScript

\* CSS

\* jsPDF

\* Web Speech API



\### Backend



\* Python

\* FastAPI

\* Uvicorn



\### Machine Learning



\* Pandas

\* NumPy

\* Scikit-learn

\* TF-IDF Vectorization

\* Cosine Similarity

\* Natural Language Preprocessing



\### Data



\* CSV-based Recipe Dataset

\* 790 Unique Recipes

\* Recipe Images

\* Cooking Instructions



\### Development Tools



\* Git

\* GitHub

\* Visual Studio Code



\---



\## 🚀 Getting Started



\### 1. Clone the Repository



```bash

git clone https://github.com/rutujasargar-eng/AI-Chef.git

cd AI-Chef

```



\### 2. Install Dependencies



Install the required frontend and backend dependencies according to the project configuration.



\### 3. Configure Environment Variables



Create a `.env` file inside the `backend` folder if API credentials are required for optional AI services.



Example:



```env

HF\_TOKEN=your\_huggingface\_token

```



\### 4. Run the Application



Start the FastAPI backend and React frontend using the project's configured development commands.



\---



\## 🎤 Voice Input



AI Chef supports voice-based ingredient input using the browser's \*\*Web Speech API\*\*.



Users can speak their ingredients instead of typing them manually.



\### Example



```text

"Chicken, tomato, onion and garlic"

```



The spoken input is converted into text and used by the recipe recommendation system.



\---



\## ⭐ Dish Reviews \& Community



AI Chef allows users to share their cooked dishes with the community.



Users can:



\* 🖼️ Upload a dish image

\* 👤 Enter their name

\* ⭐ Give a rating from 1–5 stars

\* ✍️ Write a review

\* 👀 View submitted community reviews

\* 🗑️ Delete their own submitted reviews



Review and saved-dish data are currently stored using \*\*browser localStorage\*\*.



> \*\*Note:\*\* No external database is currently used for these features.



\---



\## 📊 Dataset



The recipe dataset contains \*\*790 unique recipes\*\* collected using the official \*\*TheMealDB API\*\*.



Each recipe contains information such as:



\* Recipe Name

\* Ingredients

\* Cuisine

\* Category

\* Recipe Image

\* Cooking Instructions



The dataset is stored locally at:



```text

data/recipes.csv

```



\---



\## 🔐 Environment Variables



Create a `.env` file inside the `backend` directory for API credentials used by optional AI services.



Example:



```env

HF\_TOKEN=your\_huggingface\_token

```



> \*\*Important:\*\* Do not commit your `.env` file or API credentials to GitHub.



\---



\## ⚠️ Limitations



\* Recipe data is currently stored in a \*\*CSV file\*\* rather than a production database.

\* Saved recipes and community reviews use \*\*browser localStorage\*\*.

\* Voice input depends on \*\*browser support and microphone permissions\*\*.

\* Image-based ingredient detection is currently a \*\*prototype\*\* and may not identify every ingredient accurately.

\* Recipe metadata such as cooking time, difficulty, ratings, and reviews may require further enrichment for production use.

\* The current recommendation model primarily uses \*\*ingredient similarity\*\* and does not yet consider personalized user preferences.



\---



\## 🔮 Future Improvements



\* 🗄️ Integrate a production database such as PostgreSQL or Firebase.

\* 👁️ Improve image-based ingredient detection using a more reliable computer vision model.

\* 👤 Add user authentication and personalized recommendations.

\* 🥗 Add nutrition and calorie information.

\* 📈 Improve recommendation accuracy using user feedback.

\* 🔎 Add advanced filtering by:



&#x20; \* Cuisine

&#x20; \* Cooking time

&#x20; \* Dietary preferences

&#x20; \* Difficulty level

\* ☁️ Deploy the application using cloud services.

\* 📚 Expand and continuously update the recipe dataset.

\* 🧠 Explore more advanced recommendation techniques and AI models.



\---



\## 🎓 Learning Outcomes



Through this project, I gained practical experience in:



\* Building a full-stack application using \*\*React and FastAPI\*\*

\* Developing a \*\*machine-learning-based recommendation system\*\*

\* Working with \*\*TF-IDF and Cosine Similarity\*\*

\* Designing and consuming \*\*REST APIs\*\*

\* Integrating \*\*browser-based voice recognition\*\*

\* Handling \*\*image uploads and AI-based ingredient detection\*\*

\* Managing frontend state and \*\*browser localStorage\*\*

\* Working with datasets using \*\*Pandas\*\*

\* Using \*\*Git and GitHub\*\* for version control

\* Building and documenting an \*\*end-to-end AI application\*\*



\---



\## 👨‍💻 Author



\*\*Rutuja Sargar\*\*



B.Tech Artificial Intelligence Student



\*\*GitHub:\*\*

https://github.com/rutujasargar-eng



\---



\## 📄 License



This project is created for \*\*educational and portfolio purposes\*\*.



