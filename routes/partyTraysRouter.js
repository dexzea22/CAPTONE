const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Route for Party Trays in descending order by createdAt
router.get('/', async (req, res) => { // Changed the path to '/partyTrays' for clarity and uniqueness
    const category = 'Party Trays';
    try {
        console.log(`Fetching items for category: ${category}`);
        
        // Fetching food items filtered by category using Prisma, in descending order by createdAt
        const foodItems = await prisma.foodItem.findMany({
            where: {
                category: 'Party Trays',
                deleted: false // Only fetch non-deleted items
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('Fetched items:', foodItems);
        res.render('partyTrays', { foodItems });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;