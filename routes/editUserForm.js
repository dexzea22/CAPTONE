// editUserForm.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to login page if not authenticated
}

// GET request handler for the Edit User Form
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.redirect('/login'); // Redirect to login if user not found
    }

    res.render('editUserForm', { title: 'Edit User', Admin: user.isAdmin }); // Assuming isAdmin is a field in your user model
  } catch (error) {
    console.error('Error fetching user data for edit:', error);
    res.status(500).send('An error occurred while fetching user data.');
  }
});

// POST request handler for updating the admin password
router.post('/updateAdminPassword', ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if newPassword matches confirmPassword
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "New passwords do not match." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update the password in the database
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Error updating password. Please try again later.' });
  }
});

module.exports = router;
