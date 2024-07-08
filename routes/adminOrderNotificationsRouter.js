// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create router
const router = express.Router();
// Middleware to check if user is authenticated
function authenticate(req, res, next) {
    // Use Passport's built-in method to check authentication
    if (req.isAuthenticated()) {  // Checks if the user session is saved and valid
      console.log('User authenticated with userId:', req.user.id); // Log the authenticated user's ID
      next();  // Continue to next middleware or request handler
    } else {
      console.log('User not authenticated. Redirecting to login.');
      res.redirect('/login');  // Redirect to login page if not authenticated
    }
  }
  
  
  
  // Middleware to check user type and restrict access to specific routes
  async function restrictAccess(userType, req, res, next) {
    if (req.user && req.user.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
        });
  
        if (user.usertype !== userType) {
          return res.redirect('/login'); // Redirect unauthorized users to login
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
      }
    } else {
      return res.redirect('/login');
    }
  }

// Define routes for fetching all orders not delivered
router.get('/', authenticate, (req, res, next) => restrictAccess('Admin', req, res, next), async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                NOT: [{ status: 'delivered' }]
            },
            include: {
                user: true, // Include user details
                orderItems: true // Include order items
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.render('adminOrderNotifications', { orders });
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
            res.json(order);
        } else {
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
    }
});

// Update an order status
router.post('/update/:orderId', async (req, res) => {
    const { newStatus } = req.body;

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: req.params.orderId },
            data: { status: newStatus }
        });

        res.json({ success: true, message: 'Order status updated successfully.', updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
});

// Delete an order
router.post('/delete/:orderId', async (req, res) => {
    try {
        // Delete all associated order items
        await prisma.orderItem.deleteMany({
            where: { orderId: req.params.orderId }
        });

        // Delete the order
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
