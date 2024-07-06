const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Route for all food items in descending order by createdAt
router.get('/', async (req, res) => {
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

        // Render the food menu view and pass the separated data
        res.render('foodMenu', { soloMeals, partyTrays });

    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await prisma.$disconnect(); // Disconnect Prisma client
    }
});

module.exports = router;
