from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.recommender import recommend_recipes
from backend.image_detector import detect_ingredients_from_image


# ============================================================
# Create FastAPI application
# ============================================================

app = FastAPI(
    title="AI Chef API",
    description="Smart recipe recommendation and AI ingredient detection API",
    version="1.0.0"
)


# ============================================================
# CORS Configuration
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Home Endpoint
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Chef API",
        "status": "running"
    }


# ============================================================
# Recipe Recommendation Endpoint
# ============================================================

@app.get("/recommend")
def get_recommendations(
    ingredients: str = Query(
        ...,
        description="Comma-separated ingredients"
    ),
    top_n: int = Query(
        5,
        ge=1,
        le=10,
        description="Number of recipes to return"
    )
):

    # Get recommendations from the recommendation engine
    results = recommend_recipes(
        ingredients,
        top_n
    )

    # Convert DataFrame to list of dictionaries
    recipes = results.to_dict(
        orient="records"
    )

    # Prepare API response
    response = []

    for recipe in recipes:

        similarity = float(
            recipe.get("similarity_score", 0)
        )

        response.append({
            "recipe_id": int(recipe["recipe_id"]),
            "name": recipe["name"],
            "ingredients": recipe["ingredients"],
            "cuisine": recipe["cuisine"],
            "category": recipe["category"],
            "cooking_time": int(recipe["cooking_time"]),
            "difficulty": recipe["difficulty"],
            "rating": float(recipe["rating"]),
            "reviews": int(recipe["reviews"]),
            "image_url": recipe["image_url"],
            "instructions": recipe["instructions"],

            # Recommendation similarity score
            "similarity_score": round(
                similarity,
                4
            ),

            # Display percentage
            "match_percentage": round(
                similarity * 100,
                1
            )
        })

    return {
        "success": True,
        "query": ingredients,
        "count": len(response),
        "recipes": response
    }


# ============================================================
# Image → Ingredient Detection Endpoint
# ============================================================

@app.post("/detect-ingredients")
async def detect_ingredients(
    image: UploadFile = File(...)
):
    """
    Detect visible food ingredients from an uploaded image
    using Gemini Vision.
    """

    # --------------------------------------------------------
    # Check file type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP image."
        )

    # --------------------------------------------------------
    # Read uploaded image
    # --------------------------------------------------------

    image_bytes = await image.read()

    # --------------------------------------------------------
    # Check image size
    # Maximum allowed size = 10 MB
    # --------------------------------------------------------

    max_size = 10 * 1024 * 1024

    if len(image_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10 MB."
        )

    # Check for empty file
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    # --------------------------------------------------------
    # Send image to Gemini Vision
    # --------------------------------------------------------

    try:

        ingredients = detect_ingredients_from_image(
            image_bytes=image_bytes,
            mime_type=image.content_type
        )

        return {
            "success": True,
            "filename": image.filename,
            "ingredients": ingredients,
            "count": len(ingredients)
        }

    except Exception as e:

        print("=" * 70)
        print("INGREDIENT DETECTION ERROR:")
        print(repr(e))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )