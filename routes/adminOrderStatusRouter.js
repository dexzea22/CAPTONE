// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();

// Define routes
router.get('/', async (req, res) => {
    const { orderId = '', statusTerm = '' } = req.query;

    try {
        const filterOptions = {
            AND: [
                ...(orderId ? [{ id: orderId }] : []), // Search by Order ID if provided
                ...(statusTerm ? [{ status: { contains: statusTerm, mode: 'insensitive' } }] : []) // Filter by status if provided
            ]
        };

        const orders = await prisma.order.findMany({
            where: filterOptions,
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.render('adminOrderStatus', {
            orders,
            orderId, // Pass orderId back to the view for persistent search value
            statusTerm, // Pass statusTerm back to the view for selection persistence
            successMsg: req.flash('success'),
            errorMsg: req.flash('error')
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Error fetching orders.');
        res.redirect('/adminOrderStatus');
    }
});

// Delete an order and its related items
router.post('/delete/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    // First, delete related order items
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    });

    // Then, delete the order
    await prisma.order.delete({
      where: { id: orderId }
    });

    res.json({ success: true, message: 'Order and related items deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
});


// Fetch order details for viewing
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

module.exports = router;
