const express = require("express");
const { PrismaClient } = require("@prisma/client");
const generateRecommendations = require("../utils/generateRecommendations");
const router = express.Router();
const prisma = new PrismaClient();

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {  // Passport method to check authentication
    return next();
  } else {
    console.log("Unauthorized attempt to access dietary preferences");
    res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
  }
}

router.post("/submit-dietary-preferences", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id; // Use req.user provided by Passport
  const dietaryData = req.body;
  console.log("CALL2", dietaryData);

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

    // Generate recommendations based on the dietaryData
    const recommendations = await generateRecommendations(dietaryData);
    console.log("CALL1", dietaryData);

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
