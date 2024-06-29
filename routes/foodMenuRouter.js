const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Route for all food items in descending order by createdAt
router.get('/', async (req, res) => {
    try {
        // Fetch all food items from the database using Prisma in descending order by createdAt
        const foodItems = await prisma.foodItem.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Render the food menu view and pass the foodItems data
        res.render('foodMenu', { foodItems });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;