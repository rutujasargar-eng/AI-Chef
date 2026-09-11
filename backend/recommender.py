import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load recipe database
DATA_PATH = "data/recipes.csv"

recipes = pd.read_csv(DATA_PATH)

# Make sure ingredients are treated as text
recipes["ingredients"] = recipes["ingredients"].fillna("").astype(str)

# Clean ingredients
recipes["clean_ingredients"] = (
    recipes["ingredients"]
    .str.lower()
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)

# Create TF-IDF vectors
vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english"
)

ingredient_vectors = vectorizer.fit_transform(
    recipes["clean_ingredients"]
)


def recommend_recipes(user_ingredients, top_n=5):
    """
    Recommend recipes based on the ingredients provided by the user.
    """

    # Clean user input
    user_ingredients = (
        user_ingredients
        .lower()
        .replace(",", " ")
        .strip()
    )

    if not user_ingredients:
        return recipes.head(top_n)

    # Convert user ingredients into TF-IDF vector
    user_vector = vectorizer.transform([user_ingredients])

    # Calculate similarity
    similarity_scores = cosine_similarity(
        user_vector,
        ingredient_vectors
    ).flatten()

    # Add similarity score
    results = recipes.copy()
    results["similarity_score"] = similarity_scores

    # Sort by similarity
    results = results.sort_values(
        by="similarity_score",
        ascending=False
    )

    # Return top results
    return results.head(top_n)