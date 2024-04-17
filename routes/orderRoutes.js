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

// Import necessary modules and dependencies

// Import necessary modules and dependencies

// Define route handler to fetch order data and render a view
router.get('/orderStatus', authenticate, async (req, res) => {
    try {
      // Fetch order data from the database based on the logged-in user
      const orders = await prisma.order.findMany({
        where: {
          userId: req.session.userId,
          NOT: [{ status: 'Completed' }, { status: 'delivered' }] // Exclude orders with statuses 'Completed' and 'Delivered'
        },
        include: {
          orderItems: true,
        },
      });
  
      // Render the orderStatus.ejs template with the filtered order data
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
                userId: req.session.userId,
            },
            include: {
                orderItems: true,
            },
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
