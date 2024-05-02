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
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let updateData = { firstName, lastName, address, phoneNumber };

    // Check if a new password is provided
    if (newPassword) {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long, include a number, a special character, and an uppercase letter.'
        });
      }

      // If current password exists, validate it; if not, bypass this for OAuth users setting password for the first time
      if (user.password && currentPassword) {
        const passwordValid = await bcrypt.compare(currentPassword, user.password);
        if (!passwordValid) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update the user profile
    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the profile.' });
  }
});




module.exports = router;
