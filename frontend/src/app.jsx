import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // VOICE INPUT STATE
  // =========================

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // =========================
  // SELECTED RECIPE
  // =========================

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // =========================
  // SAVED RECIPES
  // =========================

  const [savedRecipes, setSavedRecipes] = useState(() => {
    const saved = localStorage.getItem("aiChefSavedRecipes");
    return saved ? JSON.parse(saved) : [];
  });

  // =========================
  // DISH REVIEWS
  // =========================

  const [dishReviews, setDishReviews] = useState(() => {
    const savedReviews = localStorage.getItem("aiChefDishReviews");
    return savedReviews ? JSON.parse(savedReviews) : [];
  });

  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    review: "",
    image: ""
  });

  const [reviewMessage, setReviewMessage] = useState("");

  // =========================
  // CHECK VOICE SUPPORT
  // =========================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  // =========================
  // VOICE INPUT
  // =========================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎙️ Voice recognition started");

      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim();

      console.log("🎤 Recognized:", transcript);

      if (!transcript) {
        setError(
          "No speech detected. Please try again."
        );
        return;
      }

      setIngredients((previous) => {
        if (!previous.trim()) {
          return transcript;
        }

        return `${previous}, ${transcript}`;
      });

      setError("");
    };

    recognition.onerror = (event) => {
      console.error(
        "🎙️ Voice recognition error:",
        event.error
      );

      setIsListening(false);

      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          setError(
            "Microphone permission was denied. Please allow microphone access in Chrome and try again."
          );
          break;

        case "audio-capture":
          setError(
            "No microphone was detected. Please check your microphone."
          );
          break;

        case "no-speech":
          setError(
            "No speech detected. Please speak clearly and try again."
          );
          break;

        case "network":
          setError(
            "Voice recognition needs an internet connection. Please check your connection."
          );
          break;

        case "aborted":
          setError("");
          break;

        default:
          setError(
            `Voice recognition error: ${event.error}. Please try again.`
          );
      }
    };

    recognition.onend = () => {
      console.log(
        "🎙️ Voice recognition ended"
      );

      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start voice recognition:",
        error
      );

      setIsListening(false);

      setError(
        "Unable to start the microphone. Please try again."
      );
    }
  };

  // =========================
  // FIND RECIPES
  // =========================

  const findRecipes = async () => {
    if (!ingredients.trim()) {
      setError(
        "Please enter at least one ingredient."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/recommend?ingredients=${encodeURIComponent(
          ingredients
        )}&top_n=5`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch recommendations."
        );
      }

      const data = await response.json();

      setRecipes(data.recipes || []);

      setTimeout(() => {
        document
          .getElementById("recipes")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      console.error(err);

      setRecipes([]);

      setError(
        "Unable to connect to AI Chef. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CONVERT INSTRUCTIONS
  // INTO STEPS
  // =========================

  const getInstructionSteps = (instructions) => {
    if (!instructions) {
      return [];
    }

    const numberedSteps = instructions
      .split(
        /(?:Step\s*\d+\s*[:.-]?|\d+\s*[.)-])\s*/i
      )
      .map((step) => step.trim())
      .filter((step) => step.length > 10);

    if (numberedSteps.length > 1) {
      return numberedSteps;
    }

    const sentences = instructions
      .split(/(?<=[.!?])\s+/)
      .map((step) => step.trim())
      .filter((step) => step.length > 10);

    const steps = [];

    for (
      let i = 0;
      i < sentences.length;
      i += 2
    ) {
      const combined = sentences
        .slice(i, i + 2)
        .join(" ");

      if (combined.trim()) {
        steps.push(combined.trim());
      }
    }

    return steps.length > 0
      ? steps
      : [instructions];
  };

  // =========================
  // OPEN RECIPE
  // =========================

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CLOSE RECIPE
  // =========================

  const closeRecipe = () => {
    setSelectedRecipe(null);
  };

  // =========================
  // SAVE / REMOVE RECIPE
  // =========================

  const toggleSaveRecipe = (recipe) => {
    const alreadySaved = savedRecipes.some(
      (savedRecipe) =>
        savedRecipe.recipe_id ===
        recipe.recipe_id
    );

    let updatedRecipes;

    if (alreadySaved) {
      updatedRecipes = savedRecipes.filter(
        (savedRecipe) =>
          savedRecipe.recipe_id !==
          recipe.recipe_id
      );
    } else {
      updatedRecipes = [
        ...savedRecipes,
        recipe,
      ];
    }

    setSavedRecipes(updatedRecipes);

    localStorage.setItem(
      "aiChefSavedRecipes",
      JSON.stringify(updatedRecipes)
    );
  };

  // =========================
  // COPY RECIPE
  // =========================

  const copyRecipe = async (recipe) => {
    const steps = getInstructionSteps(
      recipe.instructions
    );

    const ingredientsList = recipe.ingredients
      ? recipe.ingredients
          .split(",")
          .map(
            (ingredient) =>
              `- ${ingredient.trim()}`
          )
          .join("\n")
      : "Ingredients not available";

    const instructionsList =
      steps.length > 0
        ? steps
            .map(
              (step, index) =>
                `Step ${index + 1}: ${step}`
            )
            .join("\n\n")
        : "Instructions not available";

    const recipeText = `
🍳 AI CHEF RECIPE

${recipe.name}

Cuisine: ${recipe.cuisine || "Unknown"}
Category: ${recipe.category || "Unknown"}
Match: ${recipe.match_percentage || 0}%

🥘 INGREDIENTS

${ingredientsList}

👨‍🍳 STEP-BY-STEP INSTRUCTIONS

${instructionsList}

━━━━━━━━━━━━━━━━━━━━

Created with AI Chef
Smart Recipe Recommendation Platform
`;

    try {
      await navigator.clipboard.writeText(
        recipeText
      );

      alert(
        "✅ Recipe copied to clipboard!"
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );

      alert(
        "❌ Unable to copy the recipe."
      );
    }
  };

  // =========================
  // DOWNLOAD RECIPE AS PDF
  // =========================

  const downloadRecipePDF = (recipe) => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 20;

    const contentWidth =
      pageWidth - margin * 2;

    let y = 20;

    // =========================
    // WRAPPED TEXT HELPER
    // =========================

    const addWrappedText = (
      text,
      x,
      currentY,
      maxWidth,
      fontSize = 11,
      lineHeight = 6
    ) => {
      doc.setFontSize(fontSize);

      const lines =
        doc.splitTextToSize(
          String(text),
          maxWidth
        );

      doc.text(
        lines,
        x,
        currentY
      );

      return (
        currentY +
        lines.length * lineHeight
      );
    };

    // =========================
    // PAGE SPACE HELPER
    // =========================

    const checkPageSpace = (
      requiredHeight = 20
    ) => {
      if (
        y + requiredHeight >
        pageHeight - 20
      ) {
        doc.addPage();
        y = 20;
      }
    };

    // =========================
    // HEADER
    // =========================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(24);

    doc.text(
      "AI Chef",
      margin,
      y
    );

    y += 10;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      "Smart Recipe Recommendation Platform",
      margin,
      y
    );

    y += 15;

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 15;

    // =========================
    // RECIPE TITLE
    // =========================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    y = addWrappedText(
      recipe.name,
      margin,
      y,
      contentWidth,
      20,
      9
    );

    y += 8;

    // =========================
    // RECIPE INFORMATION
    // =========================

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    y = addWrappedText(
      `Cuisine: ${
        recipe.cuisine || "Unknown"
      }`,
      margin,
      y,
      contentWidth
    );

    y = addWrappedText(
      `Category: ${
        recipe.category || "Unknown"
      }`,
      margin,
      y,
      contentWidth
    );

    y = addWrappedText(
      `Match: ${
        recipe.match_percentage || 0
      }%`,
      margin,
      y,
      contentWidth
    );

    y += 8;

    // =========================
    // INGREDIENTS
    // =========================

    checkPageSpace(30);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "Ingredients",
      margin,
      y
    );

    y += 9;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    const ingredientItems =
      recipe.ingredients
        ? recipe.ingredients
            .split(",")
            .map(
              (ingredient) =>
                ingredient.trim()
            )
            .filter(Boolean)
        : [];

    if (
      ingredientItems.length === 0
    ) {
      y = addWrappedText(
        "Ingredients not available",
        margin,
        y,
        contentWidth
      );
    } else {
      ingredientItems.forEach(
        (ingredient) => {
          checkPageSpace(12);

          y = addWrappedText(
            `• ${ingredient}`,
            margin,
            y,
            contentWidth
          );

          y += 1;
        }
      );
    }

    y += 8;

    // =========================
    // INSTRUCTIONS
    // =========================

    checkPageSpace(30);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "Step-by-Step Instructions",
      margin,
      y
    );

    y += 10;

    const steps =
      getInstructionSteps(
        recipe.instructions
      );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    if (steps.length === 0) {
      y = addWrappedText(
        "Instructions not available",
        margin,
        y,
        contentWidth
      );
    } else {
      steps.forEach(
        (step, index) => {
          checkPageSpace(30);

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(11);

          y = addWrappedText(
            `Step ${index + 1}`,
            margin,
            y,
            contentWidth,
            11,
            6
          );

          y += 2;

          doc.setFont(
            "helvetica",
            "normal"
          );

          y = addWrappedText(
            step,
            margin,
            y,
            contentWidth,
            11,
            6
          );

          y += 7;
        }
      );
    }

    // =========================
    // FOOTER
    // =========================

    checkPageSpace(20);

    y += 5;

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 8;

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(9);

    doc.text(
      "Created with AI Chef",
      margin,
      y
    );

    // =========================
    // DOWNLOAD
    // =========================

    const safeName = recipe.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    doc.save(
      `AI_Chef_${safeName}.pdf`
    );
  };

  // =========================
  // CHECK SAVED STATUS
  // =========================

  const isRecipeSaved = (recipe) => {
    return savedRecipes.some(
      (savedRecipe) =>
        savedRecipe.recipe_id ===
        recipe.recipe_id
    );
  };

  // =========================
  // DISH REVIEW FUNCTIONS
  // =========================

  const handleDishImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReviewMessage("Please select a valid image file.");
      return;
    }

    // Keep localStorage usage reasonable.
    if (file.size > 2 * 1024 * 1024) {
      setReviewMessage("Please choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setReviewForm((previous) => ({
        ...previous,
        image: reader.result
      }));
      setReviewMessage("");
    };

    reader.readAsDataURL(file);
  };

  const submitDishReview = (event) => {
    event.preventDefault();

    if (!reviewForm.name.trim()) {
      setReviewMessage("Please enter your name.");
      return;
    }

    if (!reviewForm.review.trim()) {
      setReviewMessage("Please write a review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewForm.name.trim(),
      rating: Number(reviewForm.rating),
      review: reviewForm.review.trim(),
      image: reviewForm.image,
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    const updatedReviews = [newReview, ...dishReviews];

    setDishReviews(updatedReviews);
    localStorage.setItem(
      "aiChefDishReviews",
      JSON.stringify(updatedReviews)
    );

    setReviewForm({
      name: "",
      rating: 5,
      review: "",
      image: ""
    });

    setReviewMessage("✅ Your dish review was submitted!");

    setTimeout(() => {
      setReviewMessage("");
    }, 3000);
  };

  const removeDishReview = (reviewId) => {
    const updatedReviews = dishReviews.filter(
      (review) => review.id !== reviewId
    );

    setDishReviews(updatedReviews);
    localStorage.setItem(
      "aiChefDishReviews",
      JSON.stringify(updatedReviews)
    );
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="app">

      {/* =========================
          NAVBAR
          ========================= */}

      <header className="navbar">

        <div className="logo">
          🍳 AI Chef
        </div>

        <nav>
          <a href="#home">
            Home
          </a>

          <a href="#recipes">
            Recipes
          </a>

          <a href="#about">
            About
          </a>
        </nav>

      </header>

      <main>

        {/* ==================================================
            FULL RECIPE DETAILS
            ================================================== */}

        {selectedRecipe && (

          <section className="recipe-details">

            {/* CLOSE BUTTON */}

            <button
              className="close-recipe"
              onClick={closeRecipe}
              aria-label="Close recipe"
            >
              ✕
            </button>

            <div className="recipe-details-container">

              {/* =========================
                  RECIPE IMAGE
                  ========================= */}

              <div className="recipe-details-image">

                {selectedRecipe.image_url ? (

                  <img
                    src={
                      selectedRecipe.image_url
                    }
                    alt={
                      selectedRecipe.name
                    }
                  />

                ) : (

                  <div className="image-placeholder">
                    🍳
                  </div>

                )}

              </div>

              {/* =========================
                  RECIPE CONTENT
                  ========================= */}

              <div className="recipe-details-content">

                <p className="section-label">
                  AI CHEF RECIPE
                </p>

                <h1>
                  {selectedRecipe.name}
                </h1>

                {/* =========================
                    METADATA
                    ========================= */}

                <div className="recipe-details-meta">

                  <span>
                    🌍{" "}
                    {selectedRecipe.cuisine ||
                      "Unknown"}
                  </span>

                  <span>
                    🍽️{" "}
                    {selectedRecipe.category ||
                      "Unknown"}
                  </span>

                  <span className="details-match">
                    🎯{" "}
                    {selectedRecipe.match_percentage ||
                      0}
                    % Match
                  </span>

                </div>

                {/* =========================
                    SAVE
                    ========================= */}

                <button
                  className="save-recipe-button"
                  onClick={() =>
                    toggleSaveRecipe(
                      selectedRecipe
                    )
                  }
                >
                  {isRecipeSaved(
                    selectedRecipe
                  )
                    ? "❤️ Saved Recipe"
                    : "🤍 Save Recipe"}
                </button>

                {/* =========================
                    COPY
                    ========================= */}

                <button
                  className="copy-recipe-button"
                  onClick={() =>
                    copyRecipe(
                      selectedRecipe
                    )
                  }
                >
                  📋 Copy Recipe
                </button>

                {/* =========================
                    DOWNLOAD
                    ========================= */}

                <button
                  className="download-recipe-button"
                  onClick={() =>
                    downloadRecipePDF(
                      selectedRecipe
                    )
                  }
                >
                  📥 Download Recipe
                </button>

                {/* =========================
                    INGREDIENTS
                    ========================= */}

                <div className="full-ingredients">

                  <h2>
                    🥘 Ingredients
                  </h2>

                  <ul>

                    {selectedRecipe.ingredients
                      ?.split(",")
                      .map(
                        (
                          ingredient,
                          index
                        ) => (

                          <li
                            key={index}
                          >
                            {ingredient.trim()}
                          </li>

                        )
                      )}

                  </ul>

                </div>

                {/* =========================
                    INSTRUCTIONS
                    ========================= */}

                <div className="full-instructions">

                  <h2>
                    👨‍🍳 Step-by-Step Instructions
                  </h2>

                  <div className="instruction-steps">

                    {getInstructionSteps(
                      selectedRecipe.instructions
                    ).map(
                      (
                        step,
                        index
                      ) => (

                        <div
                          className="instruction-step"
                          key={index}
                        >

                          <div className="step-number">
                            {index + 1}
                          </div>

                          <div className="step-content">

                            <h3>
                              Step{" "}
                              {index + 1}
                            </h3>

                            <p>
                              {step}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* =========================
            HERO
            ========================= */}

        <section
          className="hero"
          id="home"
        >

          <div className="hero-content">

            <p className="badge">
              ✨ Smart Recipe Recommendation
            </p>

            <h1>
              Cook smarter with
              <span> AI Chef</span>
            </h1>

            <p className="hero-text">
              Tell us what ingredients you
              have, and AI Chef will recommend
              recipes that match your kitchen.
            </p>

            {/* =========================
                SEARCH BOX
                ========================= */}

            <div className="search-box">

              <input
                type="text"
                placeholder="Example: chicken, tomato, onion, garlic"
                value={ingredients}
                onChange={(e) =>
                  setIngredients(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findRecipes();
                  }
                }}
              />

              {/* =========================
                  VOICE BUTTON
                  ========================= */}

              {voiceSupported && (

                <button
                  type="button"
                  className={`voice-button ${
                    isListening
                      ? "listening"
                      : ""
                  }`}
                  onClick={
                    startVoiceInput
                  }
                  disabled={loading}
                  title={
                    isListening
                      ? "Listening..."
                      : "Use voice input"
                  }
                  aria-label={
                    isListening
                      ? "Listening"
                      : "Use voice input"
                  }
                >
                  {isListening
                    ? "🔴"
                    : "🎙️"}
                </button>

              )}

              {/* =========================
                  FIND RECIPES
                  ========================= */}

              <button
                type="button"
                onClick={findRecipes}
                disabled={loading}
              >
                {loading
                  ? "Finding..."
                  : "Find Recipes"}
              </button>

            </div>

            {/* ERROR */}

            {error && (
              <p className="error">
                {error}
              </p>
            )}

            <p className="hint">
              💡 Try: chicken, tomato, onion,
              garlic
            </p>

          </div>

        </section>

        {/* =========================
            RECIPES
            ========================= */}

        {recipes.length > 0 && (

          <section
            className="recipes-section"
            id="recipes"
          >

            <div className="section-heading">

              <p className="section-label">
                AI Recommendations
              </p>

              <h2>
                Recipes for you
              </h2>

              <p>
                Based on the ingredients you
                provided.
              </p>

            </div>

            <div className="recipe-grid">

              {recipes.map(
                (recipe) => (

                  <div
                    className="recipe-card"
                    key={
                      recipe.recipe_id
                    }
                  >

                    {/* =========================
                        RECIPE IMAGE
                        ========================= */}

                    <div className="recipe-image-container">

                      {recipe.image_url ? (

                        <img
                          src={
                            recipe.image_url
                          }
                          alt={
                            recipe.name
                          }
                          className="recipe-image"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="image-placeholder">
                          🍳
                        </div>

                      )}

                    </div>

                    {/* =========================
                        TOP INFORMATION
                        ========================= */}

                    <div className="recipe-top">

                      <span className="cuisine">
                        🌍{" "}
                        {recipe.cuisine ||
                          "Unknown"}
                      </span>

                      <span className="match">
                        {recipe.match_percentage ||
                          0}
                        % Match
                      </span>

                    </div>

                    {/* =========================
                        NAME
                        ========================= */}

                    <h3>
                      {recipe.name}
                    </h3>

                    {/* =========================
                        CATEGORY
                        ========================= */}

                    <p className="category">
                      🍽️{" "}
                      {recipe.category ||
                        "Unknown"}
                    </p>

                    {/* =========================
                        INFORMATION
                        ========================= */}

                    <div className="recipe-info">

                      <span>
                        🌍{" "}
                        {recipe.cuisine ||
                          "Unknown"}
                      </span>

                      <span>
                        🍽️{" "}
                        {recipe.category ||
                          "Unknown"}
                      </span>

                    </div>

                    {/* =========================
                        INGREDIENTS
                        ========================= */}

                    <div className="ingredients">

                      <strong>
                        🥘 Ingredients
                      </strong>

                      <p>
                        {recipe.ingredients
                          ? `${recipe.ingredients.substring(
                              0,
                              120
                            )}${
                              recipe.ingredients
                                .length >
                              120
                                ? "..."
                                : ""
                            }`
                          : "Ingredients not available"}
                      </p>

                    </div>

                    {/* =========================
                        INSTRUCTIONS
                        ========================= */}

                    <div className="instructions">

                      <strong>
                        👨‍🍳 How to prepare
                      </strong>

                      <p>
                        {recipe.instructions
                          ? `${recipe.instructions.substring(
                              0,
                              160
                            )}${
                              recipe.instructions
                                .length >
                              160
                                ? "..."
                                : ""
                            }`
                          : "Instructions not available"}
                      </p>

                    </div>

                    {/* =========================
                        VIEW FULL RECIPE
                        ========================= */}

                    <button
                      className="view-recipe-button"
                      onClick={() =>
                        openRecipe(
                          recipe
                        )
                      }
                    >
                      View Full Recipe →
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* ==================================================
            SHARE YOUR DISH
            ================================================== */}

        <section className="dish-review-section" id="reviews">

          <div className="section-heading">
            <p className="section-label">
              Community Kitchen
            </p>

            <h2>
              Share Your Dish
            </h2>

            <p>
              Cooked something delicious? Upload your dish,
              give it a rating, and share your experience.
            </p>
          </div>

          <div className="dish-review-container">

            {/* REVIEW FORM */}

            <form
              className="dish-review-form"
              onSubmit={submitDishReview}
            >

              <div className="review-field">
                <label htmlFor="review-name">
                  Your Name
                </label>

                <input
                  id="review-name"
                  type="text"
                  placeholder="Enter your name"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      name: e.target.value
                    }))
                  }
                />
              </div>

              <div className="review-field">
                <label>
                  Your Rating
                </label>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= reviewForm.rating
                          ? "star active"
                          : "star"
                      }
                      onClick={() =>
                        setReviewForm((previous) => ({
                          ...previous,
                          rating: star
                        }))
                      }
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="review-field">
                <label htmlFor="dish-image">
                  Upload Your Dish
                </label>

                <input
                  id="dish-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleDishImage}
                />

                {reviewForm.image && (
                  <div className="review-image-preview">
                    <img
                      src={reviewForm.image}
                      alt="Dish preview"
                    />
                  </div>
                )}
              </div>

              <div className="review-field">
                <label htmlFor="dish-review">
                  Your Review
                </label>

                <textarea
                  id="dish-review"
                  rows="5"
                  placeholder="How was the recipe? Tell us about your dish..."
                  value={reviewForm.review}
                  onChange={(e) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      review: e.target.value
                    }))
                  }
                />
              </div>

              {reviewMessage && (
                <p className="review-message">
                  {reviewMessage}
                </p>
              )}

              <button
                type="submit"
                className="submit-review-button"
              >
                📤 Share My Dish
              </button>

            </form>

            {/* REVIEWS */}

            <div className="community-reviews">

              <div className="reviews-header">
                <div>
                  <p className="section-label">
                    User Feedback
                  </p>

                  <h3>
                    Community Reviews
                  </h3>
                </div>

                <span className="review-count">
                  {dishReviews.length}{" "}
                  {dishReviews.length === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              </div>

              {dishReviews.length === 0 ? (
                <div className="empty-reviews">
                  <div className="empty-review-icon">
                    🍳
                  </div>

                  <h4>
                    Be the first to share!
                  </h4>

                  <p>
                    Your cooked dish and review will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="review-list">

                  {dishReviews.map((review) => (
                    <article
                      className="dish-review-card"
                      key={review.id}
                    >

                      {review.image && (
                        <img
                          src={review.image}
                          alt={`${review.name}'s dish`}
                          className="user-dish-image"
                        />
                      )}

                      <div className="dish-review-content">

                        <div className="review-card-top">
                          <div>
                            <h4>
                              {review.name}
                            </h4>

                            <span>
                              {review.createdAt}
                            </span>
                          </div>

                          <div className="review-stars">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                        </div>

                        <p>
                          {review.review}
                        </p>

                        <button
                          type="button"
                          className="delete-review-button"
                          onClick={() =>
                            removeDishReview(review.id)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </div>

          </div>

        </section>

        {/* =========================
            ABOUT
            ========================= */}

        <section
          className="about"
          id="about"
        >

          <div>

            <p className="section-label">
              About AI Chef
            </p>

            <h2>
              Your ingredients. Smarter
              recommendations.
            </h2>

            <p>
              AI Chef uses natural language
              preprocessing, TF-IDF
              vectorization, and cosine
              similarity to compare your
              available ingredients with
              recipes and recommend relevant
              options.
            </p>

          </div>

        </section>

      </main>

      {/* =========================
          FOOTER
          ========================= */}

      <footer>

        <p>
          🍳 AI Chef — Smart Recipe
          Recommendation Platform
        </p>

        <p>
          Built with Python, FastAPI, React
          & Machine Learning
        </p>

      </footer>

    </div>
  );
}

export default App;