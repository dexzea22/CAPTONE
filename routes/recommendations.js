const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const openai = require("openai-api");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openaiApi = new openai(OPENAI_API_KEY);
const {
  revised_generated_recommendation,
} = require("../utils/revisedGenerateRecommendation");

const prisma = new PrismaClient();

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("Unauthorized attempt to access food menu");
    return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
}

// Route for all food items in descending order by createdAt
router.get('/', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch all food items from the database using Prisma
        const foodItems = await prisma.foodItem.findMany({
            where: {
                deleted: false // Only fetch non-deleted items
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Separate the food items based on their category
        const soloMeals = foodItems.filter(item => item.category === 'Solo Meals');
        const partyTrays = foodItems.filter(item => item.category === 'Party Trays');

        // Fetch user's dietary preferences
        let existingPreference = await prisma.dietaryPreference.findUnique({
            where: { userId },
        });

        if (!existingPreference) {
            existingPreference = { preferences: {} }; // Default to empty object
        }

        const dietaryData = existingPreference.preferences || {}; // Default to empty object

        // Fetch recommendations based on dietary preferences
        const apiResponse = await revised_generated_recommendation(dietaryData);
        const recommendations = apiResponse || [];

        console.log("Recommendations fetched:", recommendations);

        // Render the food menu view and pass the separated data along with recommendations
        res.render('recommendations', { soloMeals, partyTrays, recommendations });

    } catch (error) {
        console.error('Error fetching food items or recommendations:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await prisma.$disconnect(); // Disconnect Prisma client
    }
});

module.exports = router;
