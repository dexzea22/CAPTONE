const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to check if user is authenticated
function authenticate(req, res, next) {
    if (!req.isAuthenticated()) {  // Checks if the user is authenticated using Passport
        return res.redirect('/login');
    } else {
        console.log('User authenticated with userId:', req.user.id);
        next();
    }
}

// Define route handler to fetch order data and render a view
router.get('/orderStatus', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.id,
                status: {
                    notIn: ['Completed', 'Delivered', 'completed', 'delivered'].map(s => s.trim())
                }
            },
            include: {
                orderItems: {
                    include: {
                        foodItem: true // Include the associated FoodItem to get category
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Log fetched order items with foodItem details
        console.log('Fetched Order Items:', orders.map(order => order.orderItems.map(item => ({
            id: item.id,
            userId: item.userId,
            itemId: item.itemId,
            quantity: item.quantity,
            withEgg: item.withEgg,
            price: item.price,
            foodItem: {
                id: item.foodItem.id,
                name: item.foodItem.name,
                description: item.foodItem.description,
                price: item.foodItem.price,
                size: item.foodItem.size,
                price25_30: item.foodItem.price25_30,
                price45_50: item.foodItem.price45_50,
                category: item.foodItem.category,
                dietaryRestrictions: item.foodItem.dietaryRestrictions,
                imageUrl: item.foodItem.imageUrl,
                createdAt: item.foodItem.createdAt,
                deleted: item.foodItem.deleted,
                available: item.foodItem.available,
                totalPrice: item.foodItem.totalPrice
            }
        }))));

        // Modify the order items to include the necessary data for rendering
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                item.itemName = item.foodItem.name.replace('card-', ''); // Use foodItem.name for itemName
                item.category = item.foodItem.category; // Set category from foodItem
            });
        });

        console.log('Sorted Orders:', orders.map(order => `${order.id}: ${order.status}`));

        res.render('orderStatus', { orders });
    } catch (error) {
        console.error('Error fetching order data:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Route to display user order history
router.get('/orderHistory', authenticate, async (req, res) => {
    try {
        // Fetch order history data from the database based on the logged-in user
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.id,  // Use the user ID from the user object provided by Passport
            },
            include: {
                orderItems: true,
            },
            orderBy: {
                createdAt: 'desc'  // Sorting order history by creation date in descending order
            }
        });

        // Modify the order items to include the necessary data for rendering
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                item.itemName = item.itemName.replace('card-', '');
            });
        });

        // Log the order history data for debugging
        console.log('Order history data:', orders);

        // Render EJS template with order history data
        res.render('orderHistory', { orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
