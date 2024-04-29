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
  res.redirect('/login');
}

// GET request handler for the Profile page
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // Since we're using Passport, we should have access to req.user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      req.logout();
      res.redirect('/login');
    } else {
      res.render('profile', { title: 'Profile', userData: user });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('An error occurred while fetching the profile data');
  }
});

// POST request handler for updating the user profile
router.post('/', ensureAuthenticated, async (req, res) => {
  const { firstName, lastName, address, phoneNumber, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    let updateData = { firstName, lastName, address, phoneNumber };

    // Check if the current password is provided for password update
    if (currentPassword && newPassword) {
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValid) {
        return res.status(401).send('Current password is incorrect.');
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update the user profile
    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.redirect('/profile?alert=success');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('An error occurred while updating the profile.');
  }
});

module.exports = router;
