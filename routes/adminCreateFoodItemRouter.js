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
        const newFoodItem = await prisma.foodItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                size,
                category,
                dietaryRestrictions: dietaryRestrictions.split(','),
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
