const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Route for featured items with descending order by createdAt
router.get('/', async (req, res) => {
    try {
        // Fetch featured food items from the database using Prisma, limited to 3 items, in descending order by createdAt, and only non-deleted items
        const foodItems = await prisma.foodItem.findMany({
            where: {
                deleted: false // Only fetch non-deleted items
            },
            take: 3, // Limit to 3 items
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Render the featured items view and pass the foodItems data
        res.render('featuredItem', { foodItems });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
