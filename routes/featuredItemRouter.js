// featuredItemRouter.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        // Fetch only 3 food items from the database using Prisma
        const foodItems = await prisma.addFoodItem.findMany({
            take: 3 // Limit to 3 items
        });

        // Render the featured items view and pass the foodItems data
        res.render('featuredItem', { foodItems });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
