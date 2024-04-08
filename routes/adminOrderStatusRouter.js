// Import necessary modules
const express = require('express');
const router = express.Router();

// Define routes
router.get('/', (req, res) => {
    // Render the admin order status editing page
    res.render('adminOrderStatus'); // Assuming you have an EJS file named adminOrderStatus.ejs
});

router.post('/update', (req, res) => {
    // Handle updating the order status
    const orderId = req.body.orderId;
    const newStatus = req.body.newStatus;

    // Update the order status in the database or wherever it's stored
    // Example code to update the order status
    // Order.updateOne({ _id: orderId }, { status: newStatus }, (err) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send('Error updating order status');
    //     } else {
    //         res.redirect('/adminOrderStatus');
    //     }
    // });

    // Redirect back to the order status editing page
    res.redirect('/adminOrderStatus');
});

// Export the router
module.exports = router;
