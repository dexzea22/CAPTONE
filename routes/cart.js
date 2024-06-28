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
                foodItem: true 
            },
        });

        // Log the cart items to check dietaryRestrictions
        console.log('Cart Items:', cartItems);

        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        next(createError(500, 'Failed to fetch cart items.', error));
    }
});




// Add or Update Cart Item
router.post('/add', authenticate, async (req, res, next) => {
    const userId = req.user.id; // Use req.user.id which is set by Passport
    const { name, price, image, quantity, withEgg, dietaryRestrictions } = req.body; // Add dietaryRestrictions

    try {
        if (!name || !price || !image || !quantity) {
            throw new Error('Required fields are missing.'); // Validate required fields
        }

        let foodItem;

        // Find the food item based on name only (FoodItem doesn't have withEgg attribute)
        foodItem = await prisma.foodItem.findFirst({
            where: { name: name },
        });

        if (!foodItem) {
            // If the food item doesn't exist, create it with the provided details
            foodItem = await prisma.foodItem.create({
                data: { 
                    name, 
                    price, 
                    imageUrl: image,
                    dietaryRestrictions: dietaryRestrictions || [], // Add dietaryRestrictions
                },
            });
        } else {
            // If the food item exists, update it with the provided dietaryRestrictions
            foodItem = await prisma.foodItem.update({
                where: { id: foodItem.id },
                data: { 
                    dietaryRestrictions: dietaryRestrictions || [], // Add dietaryRestrictions
                },
            });
        }

        console.log('Food Item Data:', foodItem);

        // Check if the cart item already exists for the user with the same withEgg status
        let existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                itemId: foodItem.id,
                withEgg: withEgg,
            },
        });

        if (existingCartItem) {
            // If the cart item exists, update its quantity
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
                include: { foodItem: true },
            });
            console.log('Updated Cart Item:', updatedCartItem);
            res.json({ success: true, message: 'Item quantity updated in cart successfully.', cartItem: updatedCartItem });
        } else {
            // If the cart item doesn't exist, create a new cart item
            const cartItemData = {
                userId,
                itemId: foodItem.id,
                quantity,
                withEgg, // Include withEgg in cartItemData
            };

            const cartItem = await prisma.cartItem.create({
                data: cartItemData,
                include: { foodItem: true },
            });
            console.log('New Cart Item:', cartItem);
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
