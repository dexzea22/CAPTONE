// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();

// Define routes for fetching all orders with all statuses
router.get('/', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true, // Include user details
                orderItems: true // Include order items
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.render('adminTransactionHistory', { orders });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        req.flash('error', 'Error fetching transaction history.');
        res.redirect('/adminDashboard'); // Adjust this to your admin dashboard route if different
    }
});

// Fetch detailed order data for a specific order
router.get('/details/:orderId', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: {
                user: true,
                orderItems: {
                    include: {
                        foodItem: true
                    }
                }
            }
        });

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
    }
});

module.exports = router;
