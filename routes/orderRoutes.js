const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Route to display user order status
router.get('/orderStatus', authenticate, async (req, res) => {
    try {
        // Fetch order status data from the database based on the logged-in user
        const orders = await prisma.order.findMany({
            where: {
                userId: req.session.userId,
            },
        });

        // Render EJS template with order status data
        res.render('orderStatus', { orders });
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display user order history
router.get('/orderHistory', authenticate, async (req, res) => {
    try {
        // Fetch order history data from the database based on the logged-in user
        const orders = await prisma.order.findMany({
            where: {
                userId: req.session.userId,
            },
        });

        // Render EJS template with order history data
        res.render('orderHistory', { orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
