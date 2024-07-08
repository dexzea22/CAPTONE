// routes/dietaryPreferences.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const { revised_generated_recommendation } = require("../utils/revisedGenerateRecommendation");

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log("Unauthorized attempt to access dietary preferences");
    res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
  }
}

// Endpoint to submit dietary preferences
router.post("/submit-dietary-preferences", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id; // Use req.user provided by Passport
  const dietaryData = req.body;

  try {
    let dietaryPreference;
    const existingPreference = await prisma.dietaryPreference.findUnique({
      where: { userId },
    });

    if (existingPreference) {
      dietaryPreference = await prisma.dietaryPreference.update({
        where: { userId },
        data: dietaryData,
      });
    } else {
      dietaryPreference = await prisma.dietaryPreference.create({
        data: { userId, ...dietaryData },
      });
    }

    // Generate recommendations based on the updated dietaryData
    const recommendations = await revised_generated_recommendation(dietaryData);

    // Respond with the recommendations in a JSON format
    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error("Error in submitting dietary preferences:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting dietary preferences.",
    });
  }
});

module.exports = router;
