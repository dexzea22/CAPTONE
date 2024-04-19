// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();

// Define routes
router.get('/', async (req, res) => {
    const { page = 1, searchTerm = '' } = req.query;
    const pageSize = 10; // Display 10 orders per page
    const skip = (page - 1) * pageSize;

    try {
        // Adjusted query to safely handle search terms
        const totalOrders = await prisma.order.count({
            where: {
                status: { contains: searchTerm }
            }
        });

        const orders = await prisma.order.findMany({
            where: {
                status: { contains: searchTerm }
            },
            skip: skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('adminOrderStatus', {
            orders,
            currentPage: parseInt(page),
            totalPages,
            searchTerm,
            successMsg: req.flash('success'),
            errorMsg: req.flash('error')
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Error fetching orders.');
        res.redirect('/adminOrderStatus');
    }
});

// Update order status
router.post('/update', async (req, res) => {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
        req.flash('error', 'Order ID and new status are required.');
        return res.redirect('/adminOrderStatus');
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        req.flash('success', 'Order status updated successfully.');
        res.redirect('/adminOrderStatus');
    } catch (error) {
        console.error('Error updating order status:', error);
        req.flash('error', 'An unexpected error occurred.');
        res.redirect('/adminOrderStatus');
    }
});



// Delete an order and its related items
router.post('/delete/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        // First, delete related order items
        await prisma.orderItem.deleteMany({
            where: {
                orderId: orderId
            }
        });

        // Then, delete the order
        await prisma.order.delete({
            where: {
                id: orderId
            }
        });

        req.flash('success', 'Order and related items deleted successfully.');
        res.redirect('/adminOrderStatus');
    } catch (error) {
        console.error('Error deleting order:', error);
        req.flash('error', 'Failed to delete order.');
        res.redirect('/adminOrderStatus');
    }
});

// Fetch order details for editing
router.get('/details/:orderId', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: {
                orderItems: true // Include related order items
            }
        });

        if (order) {
            res.send(order);
        } else {
            res.status(404).send({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send({ success: false, message: 'Failed to fetch order details.' });
        
    }
});


function isValidOrderId(orderId) {
    return typeof orderId === 'string' && orderId.trim().length > 0;
}

module.exports = router;
