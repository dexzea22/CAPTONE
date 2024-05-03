const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Route to display the form for creating a new food item
router.get('/', (req, res) => {
    res.render('adminCreateFoodItem');
});

// Route to handle the creation of a new food item
router.post('/', async (req, res) => {
    const { name, description, price, size, category, dietaryRestrictions, imageUrl } = req.body;
    try {
        // Convert dietaryRestrictions to an array if it exists and is not an array
        const dietaryArray = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : dietaryRestrictions ? [dietaryRestrictions] : [];

        const newFoodItem = await prisma.foodItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                size,
                category,
                dietaryRestrictions: dietaryArray,
                imageUrl
            }
        });
        res.send(`Food item created successfully: ${newFoodItem.name}`);
    } catch (error) {
        console.error('Failed to create food item:', error);
        res.status(500).send('Failed to create food item.');
    }
});

module.exports = router;
