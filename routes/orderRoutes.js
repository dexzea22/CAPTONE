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
        // Fetch order data from the database based on the logged-in user
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.id,  // Use the user ID from the user object provided by Passport
                NOT: [{ status: 'Completed' }, { status: 'Delivered' }] // Exclude orders with statuses 'Completed' and 'Delivered'
            },
            include: {
                orderItems: true,
            },
            orderBy: {
                createdAt: 'desc'  // Sorting orders by creation date in descending order
            }
        });

        // Log the sorted order dates to verify they are in descending order
        console.log('Sorted Orders:', orders.map(order => order.createdAt));

        // Render the orderStatus.ejs template with the filtered and sorted order data
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

        // Log the order history data for debugging
        console.log('Order history data:', orders);

        // Render EJS template with order history data
        res.render('orderHistory', { orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500). send('Internal Server Error');
    }
});

module.exports = router;
