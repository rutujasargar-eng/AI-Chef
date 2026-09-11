import json
import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient


# ============================================================
# Load environment variables
# ============================================================

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")


# ============================================================
# Check Hugging Face token
# ============================================================

if not HF_TOKEN:
    raise RuntimeError(
        "HF_TOKEN is missing from the .env file."
    )


# ============================================================
# Hugging Face Inference Client
# IMPORTANT:
# We explicitly use hf-inference.
# We do NOT use provider='auto'.
# ============================================================

client = InferenceClient(
    provider="auto",
    api_key=HF_TOKEN
)


# ============================================================
# Ingredient Detection
# ============================================================

def detect_ingredients_from_image(
    image_bytes: bytes,
    mime_type: str
):
    """
    Detect visible food ingredients from an image
    using Hugging Face's Inference API.
    """

    # Convert image to Base64
    import base64

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    # Create image data URL
    image_data_url = (
        f"data:{mime_type};base64,{image_base64}"
    )

    # ========================================================
    # Prompt
    # ========================================================

    prompt = """
Analyze this image as a food ingredient detector.

Identify the food ingredients that are clearly visible.

Rules:
- Only identify ingredients that are actually visible.
- Do not invent ingredients.
- Use simple common English names.
- Remove duplicate ingredients.
- Do not include plates, utensils, packaging,
  cooking equipment, or complete dishes.
- Return ONLY valid JSON.
- The JSON must contain one key called "ingredients".
- "ingredients" must be an array of strings.

Example:

{
    "ingredients": [
        "tomato",
        "onion",
        "potato",
        "carrot"
    ]
}
"""

    # ========================================================
    # Send request to Hugging Face
    # ========================================================

    response = client.chat.completions.create(
        model="meta-llama/Llama-3.2-11B-Vision-Instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data_url
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        max_tokens=300,
        temperature=0.1
    )

    # ========================================================
    # Extract response
    # ========================================================

    response_text = (
        response.choices[0]
        .message
        .content
        .strip()
    )

    print("Hugging Face response:")
    print(response_text)

    # ========================================================
    # Remove Markdown code fences if present
    # ========================================================

    if response_text.startswith("```"):

        response_text = (
            response_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

    # ========================================================
    # Convert response to JSON
    # ========================================================

    result = json.loads(response_text)

    ingredients = result.get(
        "ingredients",
        []
    )

    # ========================================================
    # Validate result
    # ========================================================

    if not isinstance(ingredients, list):
        return []

    cleaned_ingredients = []

    for ingredient in ingredients:

        if not isinstance(ingredient, str):
            continue

        ingredient = ingredient.strip()

        if not ingredient:
            continue

        # Remove duplicates
        if ingredient.lower() not in [
            item.lower()
            for item in cleaned_ingredients
        ]:
            cleaned_ingredients.append(
                ingredient
            )

    return cleaned_ingredients