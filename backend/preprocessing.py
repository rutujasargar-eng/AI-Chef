import re


def clean_ingredient(ingredient):
    """
    Clean and standardize a single ingredient.
    """

    ingredient = ingredient.lower().strip()

    # Remove extra spaces
    ingredient = re.sub(r"\s+", " ", ingredient)

    return ingredient


def process_ingredients(ingredients):
    """
    Convert a comma-separated ingredient string
    into a clean list of ingredients.
    """

    if not ingredients:
        return []

    ingredient_list = ingredients.split(",")

    cleaned = [
        clean_ingredient(ingredient)
        for ingredient in ingredient_list
        if ingredient.strip()
    ]

    return cleaned