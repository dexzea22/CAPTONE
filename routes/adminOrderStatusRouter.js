// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();

// Define routes
router.get('/', async (req, res) => {
    try {
        // Fetch all orders from the database
        const orders = await prisma.order.findMany();
        // Render the admin order status editing page with order data
        res.render('adminOrderStatus', { orders, successMsg: req.flash('success'), errorMsg: req.flash('error') });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Error fetching orders.');
        res.redirect('/adminOrderStatus');
    }
});

router.post('/update', async (req, res) => {
    try {
        // Retrieve order ID and new status from the form submission
        const orderId = req.body.orderId;
        const newStatus = req.body.newStatus;

        // Server-side validation
        if (!orderId || !newStatus) {
            // Return an error response if either order ID or new status is missing
            req.flash('error', 'Order ID and new status are required.');
            return res.redirect('/adminOrderStatus');
        }

        // Validate orderId format and length before querying the database
        if (!isValidOrderId(orderId)) {
            // Return an error response if orderId is invalid
            req.flash('error', 'Invalid order ID format.');
            return res.redirect('/adminOrderStatus');
        }

        // Check if the order ID exists in the database
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            // Return an error response if the order ID does not exist
            req.flash('error', 'Order not found.');
            return res.redirect('/adminOrderStatus');
        }

        // Check if the new status is one of the allowed status values
        const allowedStatusValues = ['Preparing', 'Cooking', 'Ready', 'Dispatched', 'Delivered'];
        if (!allowedStatusValues.includes(newStatus)) {
            // Return an error response if the new status is invalid
            req.flash('error', 'Invalid new status.');
            return res.redirect('/adminOrderStatus');
        }

        // Update the order status in the database
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        // Set a success flash message
        req.flash('success', 'Order status updated successfully.');

        // Redirect back to the order status editing page
        res.redirect('/adminOrderStatus');
    } catch (error) {
        console.error('Error updating order status:', error);
        // Return an error response if an unexpected error occurs
        req.flash('error', 'An unexpected error occurred.');
        res.redirect('/adminOrderStatus');
    }
});

// Function to validate orderId format (Alphanumeric string)
function isValidOrderId(orderId) {
    // Check if orderId is a non-empty string
    return typeof orderId === 'string' && orderId.length > 0;
}


// Export the router
module.exports = router;
