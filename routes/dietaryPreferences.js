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
    return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
  }
}

router.post("/submit-dietary-preferences", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id; // Use req.user provided by Passport
  const dietaryData = req.body; // Assumed to be an object with preference data

  try {
    console.log('Received dietary data:', dietaryData); // Log received data

    // Ensure dietaryData is a valid object
    if (typeof dietaryData !== 'object' || dietaryData === null) {
      console.error('Invalid dietary data format:', dietaryData);
      return res.status(400).json({
        success: false,
        message: "Invalid dietary preferences data."
      });
    }

    // Fetch existing dietary preferences
    const existingPreference = await prisma.dietaryPreference.findUnique({
      where: { userId },
    });

    if (existingPreference) {
      // Update existing preferences
      console.log('Updating existing dietary preferences for user:', userId);
      await prisma.dietaryPreference.update({
        where: { userId },
        data: {
          preferences: dietaryData, // Ensure only preferences are updated
        },
      });
    } else {
      // Create new dietary preferences
      console.log('Creating new dietary preferences for user:', userId);
      await prisma.dietaryPreference.create({
        data: { userId, preferences: dietaryData },
      });
    }

    // Generate recommendations based on updated preferences
    const recommendations = await revised_generated_recommendation(dietaryData);
    console.log('Generated recommendations:', recommendations); // Log generated recommendations

    // Respond with JSON indicating success
    res.json({
      success: true,
      message: "Dietary preferences submitted successfully.",
      recommendations: recommendations
    });
  } catch (error) {
    console.error("Error in submitting dietary preferences:", error);

    // Respond with JSON error message
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting dietary preferences.",
      error: error.message
    });
  }
});


module.exports = router;
