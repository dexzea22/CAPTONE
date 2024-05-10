const express = require("express");
const router = express.Router();
const openai = require("openai-api");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openaiApi = new openai(OPENAI_API_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  revised_generated_recommendation,
  extractValues,
} = require("../utils/revisedGenerateRecommendation");

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("Unauthorized attempt to access dietary preferences");
  return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
}

// Endpoint to display the recommendations page
router.get("/", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const existingPreference = await prisma.dietaryPreference.findUnique({
      where: { userId },
    });

    if (!existingPreference) {
      return res.status(404).json({ success: false, message: "Dietary preferences not found." });
    }

    const dietaryData = {
      vegetarian: existingPreference.vegetarian || false,
      omnivore: existingPreference.omnivore || false,
      glutenFree: existingPreference.glutenFree || false,
      nutAllergy: existingPreference.nutAllergy || false,
    };

    // Fetch recommendations based on dietary preferences
    const apiResponse = await revised_generated_recommendation(dietaryData);

    // Log the raw API response for debugging
    console.log("API Response:", JSON.stringify(apiResponse, null, 2));

    // Directly use the response if it's already in the correct format
    const recommendations = apiResponse;  

    if (!recommendations || recommendations.length === 0) {
      console.log("No recommendations available for the given preferences:", dietaryData);
      return res.render("recommendations", { recommendations: null });
    }

    console.log("Recommendations fetched:", recommendations);
    res.render("recommendations", {
      recommendations: recommendations, // Directly pass the array of strings
    });
  } catch (error) {
    console.error("Error in fetching recommendations:", error);
    res.status(500).render("recommendations", {
      recommendations: null,
      error: "Failed to fetch recommendations due to an internal server error."
    });
  }
});




module.exports = router;
