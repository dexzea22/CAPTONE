const express = require('express');
const createError = require('http-errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to check if user is authenticated using Passport
function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('User authenticated with userId:', req.user.id);
        next();
    } else {
        console.log('User not authenticated. Redirecting to login.');
        res.redirect('/login');
    }
}
// Fetch Cart Items for a User
router.get('/items', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Use req.user.id which is set by Passport
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: userId },
            include: { foodItem: true },
        });
        console.log('Cart Items:', cartItems);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Failed to fetch cart items.', error: error.message });
    }
});


// Add or Update Cart Item
router.post('/add', authenticate, async (req, res) => {
    const userId = req.user.id; // Use req.user.id which is set by Passport
    const { name, size, price, image, quantity } = req.body;

    try {
        let foodItem = await prisma.foodItem.findUnique({
            where: { name_size: { name, size } },
        });

        if (!foodItem) {
            foodItem = await prisma.foodItem.create({
                data: { name, size, price, imageUrl: image },
            });
        }

        let existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId: userId,
                itemId: foodItem.id,
            },
        });

        if (existingCartItem) {
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
                include: { foodItem: true },
            });
            res.status(200).json({ success: true, message: 'Item quantity updated in cart successfully.', cartItem: updatedCartItem });
        } else {
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
        }
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        res.status(500).json({ message: 'Could not add item to cart.', error: error.message });
    }
});

// Update Cart Item Quantity
router.put('/updateQuantity', authenticate, async (req, res) => {
    const userId = req.user.id; // Use the user ID from Passport's user object
    const { cartItemId, quantity } = req.body;

    try {
        // Update cart item quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId, userId: userId }, // Ensure the item belongs to the logged-in user
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
router.delete('/delete/:cartItemId', authenticate, async (req, res) => {
    const userId = req.user.id; // Use the user ID from Passport's user object
    const cartItemId = req.params.cartItemId;

    try {
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

        res.status(200).json({ success: true, message: 'Cart item deleted successfully.' });
    } catch (error) {
        console.error('Failed to delete cart item:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the cart item.', error: error.message });
    }
});


module.exports = router;
