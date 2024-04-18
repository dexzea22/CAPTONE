const express = require('express');
const createError = require('http-errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to check if user is authenticated
function authenticate(req, res, next) {
    console.log('Session:', req.session);
    if (!req.session.userId) {
        return res.redirect('/login');
    } else {
        console.log('User authenticated with userId:', req.session.userId);
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
        console.log('Cart Items:', cartItems); // Log retrieved cart items
        
        // Store cart items in session
        req.session.cartItems = cartItems;

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

        // Attempt to find the food item
        let foodItem = await prisma.foodItem.findUnique({
            where: { name_size: { name, size } },
        });

        if (!foodItem) {
            // Food item does not exist, create it
            foodItem = await prisma.foodItem.create({
                data: { name, size, price, imageUrl: image },
            });
        }

        // Check if the item already exists in the cart
        let existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId: userId,
                itemId: foodItem.id,
            },
        });

        if (existingCartItem) {
            // If item already exists, update the quantity
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
                include: { foodItem: true },
            });
            return res.status(200).json({ success: true, message: 'Item quantity updated in cart successfully.', cartItem: updatedCartItem });
        } else {
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
            return res.status(200).json({ success: true, message: 'Item added to cart successfully.', cartItem });
        }
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        return res.status(500).json({ message: 'Could not add item to cart.', error: error.message });
    }
});

// Update Cart Item Quantity
router.put('/updateQuantity', async (req, res) => {
    const userId = req.session && req.session.userId; // Check if session exists and userId is set
    const { cartItemId, quantity } = req.body;

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Update cart item quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: { foodItem: true },
        });

        res.status(200).json({ success: true, message: 'Item quantity updated successfully.', updatedCartItem });
    } catch (error) {
        console.error('Failed to update item quantity:', error);
        res.status(500).json({ message: 'Could not update item quantity.', error: error.message });
    }
});

// Delete Cart Item
router.delete('/delete/:cartItemId', async (req, res) => {
    const userId = req.session && req.session.userId; // Check if session exists and userId is set
    const cartItemId = req.params.cartItemId;

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Check if the cart item belongs to the current user
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId: userId,
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to the current user.' });
        }

        // Delete cart item
        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        // Send a success response back to the client
        res.status(200).json({ success: true, message: 'Cart item deleted successfully.' });
    } catch (error) {
        // Handle any errors that occur during the deletion process
        console.error('Failed to delete cart item:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the cart item.', error: error.message });
    }
});


module.exports = router;
