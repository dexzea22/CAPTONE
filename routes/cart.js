const express = require('express');
const createError = require('http-errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to check if user is authenticated
function authenticate(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    } else {
        next();
    }
}

// Fetch Cart Items for a User
router.get('/items', authenticate, async (req, res) => {
    try {
        // Ensure user is logged in
        const userId = req.session.userId;
        // Fetch cart items for the user
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: userId },
            include: { foodItem: true },
        });
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Failed to fetch cart items.', error: error.message });
    }
});
// Add or Update Cart Item
router.post('/add', async (req, res) => {
    const userId = req.session && req.session.userId; // Check if session exists and userId is set
    const { name, size, price, image, quantity } = req.body;

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Attempt to find or create the food item
        let foodItem = await prisma.foodItem.findUnique({
            where: { name_size: { name, size } },
        });

        if (!foodItem) {
            // Food item does not exist, create it
            foodItem = await prisma.foodItem.create({
                data: { name, size, price, imageUrl: image },
            });
        }

        // Create cart item
        const cartItem = await prisma.cartItem.create({
            data: {
                userId,
                itemId: foodItem.id,
                quantity,
            },
            include: {
                foodItem: true,
            },
        });

        res.status(200).json({ success: true, message: 'Item added to cart successfully.', cartItem });
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        res.status(500).json({ message: 'Could not add item to cart.', error: error.message });
    }
});

module.exports = router;
