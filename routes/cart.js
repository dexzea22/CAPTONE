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
        res.redirect('/login'); // Redirect to your login route
    }
}

// Fetch Cart Items for a User
router.get('/items', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id; // Use req.user.id which is set by Passport
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                foodItem: true // Ensure that foodItem is included
            },
        });

        // Filter out any cart items where foodItem is null
        const validCartItems = cartItems.filter(item => item.foodItem !== null);

        // Log the cart items to check dietaryRestrictions
        console.log('Cart Items:', validCartItems);

        res.json(validCartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        next(createError(500, 'Failed to fetch cart items.', error));
    }
});


router.post('/add', authenticate, async (req, res, next) => {
    const userId = req.user.id;
    const { name, price, image, quantity, withEgg, dietaryRestrictions } = req.body;

    try {
        if (!name || !price || !image || !quantity || !dietaryRestrictions) {
            throw new Error('Required fields are missing.');
        }

        let foodItem;

        // Find or create the food item based on name
        foodItem = await prisma.foodItem.findFirst({
            where: { name: name },
        });

        if (!foodItem) {
            // Create the food item if it doesn't exist
            foodItem = await prisma.foodItem.create({
                data: { name, price, imageUrl: image, dietaryRestrictions: dietaryRestrictions },
            });
            console.log('New food item created:', foodItem); // Log newly created food item
        }

        // Check if the cart item already exists for the user with the same withEgg status
        let existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                itemId: foodItem.id,
                withEgg: withEgg,
            },
            include: { foodItem: true }, // Ensure foodItem is included
        });

        if (existingCartItem) {
            // Update the quantity if the cart item exists
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
                include: { foodItem: true },
            });
            console.log('Updated cart item:', updatedCartItem); // Log updated cart item
            res.json({ success: true, message: 'Item quantity updated in cart successfully.', cartItem: updatedCartItem });
        } else {
            // Create a new cart item if it doesn't exist
            const cartItemData = {
                userId,
                itemId: foodItem.id,
                quantity,
                withEgg,
            };

            const cartItem = await prisma.cartItem.create({
                data: cartItemData,
                include: { foodItem: true }, // Ensure foodItem is included
            });
            console.log('New cart item added:', cartItem); // Log newly added cart item
            res.json({ success: true, message: 'Item added to cart successfully.', cartItem });
        }
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        next(createError(500, 'Could not add item to cart.', error));
    }
});


// Update Cart Item Quantity
router.put('/updateQuantity', authenticate, async (req, res, next) => {
    const userId = req.user.id; // Use the user ID from Passport's user object
    const { cartItemId, quantity } = req.body;

    try {
        // Update cart item quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId, userId }, // Ensure the item belongs to the logged-in user
            data: { quantity },
            include: { foodItem: true },
        });

        res.json({ success: true, message: 'Item quantity updated successfully.', updatedCartItem });
    } catch (error) {
        console.error('Failed to update item quantity:', error);
        next(createError(500, 'Could not update item quantity.', error));
    }
});

// Delete Cart Item
router.delete('/delete/:cartItemId', authenticate, async (req, res, next) => {
    const userId = req.user.id; // Use the user ID from Passport's user object
    const cartItemId = req.params.cartItemId;

    try {
        // Check if the cart item belongs to the current user
        const cartItem = await prisma.cartItem.findFirst({
            where: { id: cartItemId, userId },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to the current user.' });
        }

        // Delete cart item
        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        res.json({ success: true, message: 'Cart item deleted successfully.' });
    } catch (error) {
        console.error('Failed to delete cart item:', error);
        next(createError(500, 'An error occurred while deleting the cart item.', error));
    }
});

module.exports = router;
