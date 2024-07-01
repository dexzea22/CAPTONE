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
                foodItem: true // Include the related foodItem data
            },
        });

        // Filter out any cart items where foodItem is null
        const validCartItems = cartItems.filter(item => item.foodItem !== null);

        // Log the cart items to check dietaryRestrictions (optional)
        console.log('Fetched Cart Items:', validCartItems);

        // Modify each cart item to include the correct itemPrice for Party Trays items
        const enhancedCartItems = validCartItems.map(item => {
            const foodItem = item.foodItem;
            let itemPrice = 0;

            if (foodItem.category === 'Solo Meals') {
                itemPrice = foodItem.price;
                if (item.withEgg) {
                    itemPrice += 5; // Add price for egg if applicable
                }
            } else if (foodItem.category === 'Party Trays') {
                // Determine the correct price based on user selection
                itemPrice = item.price; // Use the user-selected price from cartItem
            }

            return {
                ...item,
                itemPrice: itemPrice.toFixed(2), // Format price to two decimal places
            };
        });

        res.json(enhancedCartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        next(createError(500, 'Failed to fetch cart items.', error));
    }
});











router.post('/add', authenticate, async (req, res, next) => {
    const userId = req.user.id;
    const { name, price, price25_30, price45_50, image, quantity, withEgg, dietaryRestrictions, category } = req.body;

    try {
        if (!name || !image || !quantity || !dietaryRestrictions) {
            throw new Error('Required fields are missing.');
        }

        let foodItem = await prisma.foodItem.findFirst({
            where: { name: name },
        });

        if (!foodItem) {
            const foodItemData = {
                name,
                imageUrl: image,
                dietaryRestrictions,
                category,
                price: category !== 'Party Trays' ? price : undefined,
                price25_30: category === 'Party Trays' ? price25_30 : undefined,
                price45_50: category === 'Party Trays' ? price45_50 : undefined,
            };

            foodItem = await prisma.foodItem.create({
                data: foodItemData,
            });
            console.log('New food item created:', foodItem);
        }

        let selectedPrice = price;

        if (category === 'Party Trays') {
            if (price25_30) {
                selectedPrice = price25_30;
            } else if (price45_50) {
                selectedPrice = price45_50;
            }
        }

        // Check if there's an existing cart item with the same user, item, price, and options
        let existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                itemId: foodItem.id,
                withEgg: withEgg,
                price: selectedPrice,
            },
            include: { foodItem: true },
        });

        if (existingCartItem) {
            // If an existing cart item is found, update its quantity
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
                include: { foodItem: true },
            });
            console.log('Updated cart item quantity:', updatedCartItem);
            res.json({ success: true, message: 'Item quantity updated in cart successfully.', cartItem: updatedCartItem });
        } else {
            // Create a new cart item with the selected price
            const cartItemData = {
                userId,
                itemId: foodItem.id,
                quantity,
                withEgg,
                price: selectedPrice,
            };

            const cartItem = await prisma.cartItem.create({
                data: cartItemData,
                include: { foodItem: true },
            });
            console.log('New cart item added:', cartItem);
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
