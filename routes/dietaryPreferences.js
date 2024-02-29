const express = require("express");
const { PrismaClient } = require("@prisma/client");
const generateRecommendations = require("../utils/generateRecommendations");
const router = express.Router();
const prisma = new PrismaClient();

router.post("/submit-dietary-preferences", async (req, res) => {
  if (!req.session || !req.session.userId) {
    console.log("Unauthorized attempt to access dietary preferences");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access. Please log in." });
  }

  const userId = req.session.userId;
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
