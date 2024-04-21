// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();

// Define routes for fetching orders with pagination
router.get('/', async (req, res) => {
    const { page = 1 } = req.query;
    const pageSize = 10; // Display 10 orders per page
    const skip = (page - 1) * pageSize;

    try {
        const totalOrders = await prisma.order.count({
            where: {
                NOT: [
                    { status: 'delivered' }
                ]
            }
        });

        const orders = await prisma.order.findMany({
            where: {
                NOT: [
                    { status: 'delivered' }
                ]
            },
            include: {
                user: true, // Include user details
                orderItems: true // Include order items
            },
            skip: skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('adminOrderNotifications', {
            orders,
            currentPage: parseInt(page),
            totalPages
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Error fetching orders.');
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
            console.log("Sending order data:", order); // Add this line to log the data
            res.json(order);
        } else {
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
    }
});


// Update order status
router.post('/update/:orderId', async (req, res) => {
    try {
        const { newStatus } = req.body;
        await prisma.order.update({
            where: { id: req.params.orderId },
            data: { status: newStatus }
        });
        res.json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
});

// Delete an order
router.post('/delete/:orderId', async (req, res) => {
    try {
        await prisma.order.delete({
            where: { id: req.params.orderId }
        });
        res.json({ success: true, message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Failed to delete order.' });
    }
});

module.exports = router;
