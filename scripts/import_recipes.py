import csv
import json
import urllib.parse
import urllib.request
from pathlib import Path
import string
import time


# ============================================================
# AI CHEF - REAL RECIPE DATABASE IMPORTER
# Source: TheMealDB
# ============================================================

API_BASE = "https://www.themealdb.com/api/json/v1/1"

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Output CSV
OUTPUT_FILE = PROJECT_ROOT / "data" / "recipes.csv"


def fetch_json(url):
    """Fetch JSON data from an API URL."""

    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))

    except Exception as error:
        print(f"❌ Error fetching data: {error}")
        return None


def get_meals_by_letter(letter):
    """Get all meals beginning with a specific letter."""

    url = (
        f"{API_BASE}/search.php?"
        f"{urllib.parse.urlencode({'f': letter})}"
    )

    data = fetch_json(url)

    if not data:
        return []

    return data.get("meals") or []


def extract_ingredients(meal):
    """Extract ingredient + measurement pairs."""

    ingredients = []

    for number in range(1, 21):

        ingredient = meal.get(f"strIngredient{number}")
        measure = meal.get(f"strMeasure{number}")

        if ingredient and ingredient.strip():

            ingredient = ingredient.strip()

            if measure and measure.strip():
                ingredients.append(
                    f"{ingredient} ({measure.strip()})"
                )
            else:
                ingredients.append(ingredient)

    return ingredients


def clean_instructions(instructions):
    """Clean recipe instructions."""

    if not instructions:
        return ""

    return " ".join(
        instructions.replace("\r", "\n")
        .split()
    )


def create_recipe_record(meal, recipe_id):
    """Convert TheMealDB meal into our AI Chef format."""

    ingredients = extract_ingredients(meal)

    return {
        "recipe_id": recipe_id,
        "name": meal.get("strMeal") or "",
        "ingredients": ", ".join(ingredients),
        "cuisine": meal.get("strArea") or "Unknown",
        "category": meal.get("strCategory") or "Unknown",

        # TheMealDB does not provide these fields consistently.
        # We keep them in our schema for future enrichment.
        "cooking_time": 0,
        "difficulty": "Not specified",
        "rating": 0,
        "reviews": 0,

        "image_url": meal.get("strMealThumb") or "",

        "instructions": clean_instructions(
            meal.get("strInstructions")
        ),
    }


def main():

    print("=" * 60)
    print("🍳 AI CHEF - REAL RECIPE DATABASE IMPORT")
    print("=" * 60)

    all_meals = []
    seen_ids = set()

    # Search meals beginning with every letter
    for letter in string.ascii_lowercase:

        print(f"\n🔎 Fetching recipes starting with '{letter.upper()}'...")

        meals = get_meals_by_letter(letter)

        print(f"   Found: {len(meals)} recipes")

        for meal in meals:

            meal_id = meal.get("idMeal")

            if meal_id and meal_id not in seen_ids:
                seen_ids.add(meal_id)
                all_meals.append(meal)

        # Small delay to avoid sending requests too quickly
        time.sleep(0.2)

    print("\n" + "=" * 60)
    print(f"📦 Total unique recipes found: {len(all_meals)}")
    print("=" * 60)

    if not all_meals:
        print("❌ No recipes were downloaded.")
        return

    # Convert API data to AI Chef format
    recipes = []

    for index, meal in enumerate(all_meals, start=1):

        recipe = create_recipe_record(
            meal,
            index
        )

        recipes.append(recipe)

    # CSV columns
    fieldnames = [
        "recipe_id",
        "name",
        "ingredients",
        "cuisine",
        "category",
        "cooking_time",
        "difficulty",
        "rating",
        "reviews",
        "image_url",
        "instructions",
    ]

    # Make sure data folder exists
    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # Save CSV
    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as csv_file:

        writer = csv.DictWriter(
            csv_file,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(recipes)

    print("\n✅ IMPORT COMPLETE!")
    print(f"📁 Saved to:")
    print(f"   {OUTPUT_FILE}")

    print(f"\n🍽️ Recipes saved: {len(recipes)}")

    print("\nFirst 5 recipes:")

    for recipe in recipes[:5]:
        print(
            f"   {recipe['recipe_id']}. "
            f"{recipe['name']} "
            f"({recipe['cuisine']})"
        )

    print("\n⚠️ Note:")
    print("TheMealDB does not provide reliable rating,")
    print("review count, cooking time, or difficulty fields.")
    print("Those fields are kept for future enrichment.")
    print("=" * 60)


if __name__ == "__main__":
    main()