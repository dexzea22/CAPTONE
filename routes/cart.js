const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'User not logged in.' });
    }
    next();
}

// Apply the middleware to all routes in this router
router.use(ensureAuthenticated);



// Fetch Cart Items for a User
router.get('/items', async (req, res) => {
    const userId = req.session.userId;

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: userId },
            include: { foodItem: true },
        });
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Failed to fetch cart items.' });
    }
});

// Add or Update Cart Item
router.post('/add', async (req, res) => {
    const userId = req.session.userId;
    const { name, size, price, image, quantity } = req.body;

    try {
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

// Increment Item Quantity
router.post('/increment/:itemId', async (req, res) => {
    const userId = req.session.userId; // Ensure operation is performed for logged-in user's cart
    const { itemId } = req.params;

    try {
        const updatedItem = await prisma.cartItem.updateMany({
            where: { userId: userId, id: parseInt(itemId) },
            data: { quantity: { increment: 1 } },
        });
        res.json(updatedItem);
    } catch (error) {   
        console.error('Error incrementing item quantity:', error);
        res.status(500).json({ message: 'Failed to increment item quantity.' });
    }
});

// Decrement Item Quantity
router.post('/decrement/:itemId', async (req, res) => {
    const userId = req.session.userId; // Ensure operation is performed for logged-in user's cart
    const { itemId } = req.params;

    try {
        const item = await prisma.cartItem.findUnique({
            where: { id: parseInt(itemId), userId: userId },
        });

        if (item && item.quantity > 1) {
            const updatedItem = await prisma.cartItem.update({
                where: { id: parseInt(itemId) },
                data: { quantity: { decrement: 1 } },
            });
            res.json(updatedItem);
        } else {
            res.status(400).json({ message: 'Item quantity cannot be reduced further.' });
        }
    } catch (error) {
        console.error('Error decrementing item quantity:', error);
        res.status(500).json({ message: 'Failed to decrement item quantity.' });
    }
});

// Delete Cart Item
router.delete('/delete/:itemId', async (req, res) => {
    const userId = req.session.userId; // Ensure operation is performed for logged-in user's cart
    const { itemId } = req.params;

    try {
        await prisma.cartItem.deleteMany({
            where: { id: parseInt(itemId), userId: userId },
        });
        res.json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ message: 'Failed to delete cart item.' });
    }
});

module.exports = router;
