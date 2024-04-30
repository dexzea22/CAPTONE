const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



router.get('/adminUserTable', async (req, res) => {
  const users = await prisma.user.findMany();
  res.render('adminUserTable', { title: 'User Info', users });
});

// Fetch single user data for viewing or editing
router.get('/editUser/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
  });
  if(user) {
      res.render('editUserForm', { user }); // Assuming you have an 'editUserForm.ejs' for edits
  } else {
      res.status(404).send('User not found');
  }
});

// Update user data
router.post('/updateUser/:userId', async (req, res) => {
  const { email, usertype, password } = req.body;
  try {
      const updatedUser = await prisma.user.update({
          where: { id: req.params.userId },
          data: { email, usertype, password }
      });
      res.redirect('/adminUserTable');
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Failed to update user');
  }
});

// Delete an order with password confirmation
router.post('/deleteUser', async (req, res) => {
  const { email, adminPassword } = req.body;

  // Fetch the admin details using a secure method
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (admin && bcrypt.compareSync(adminPassword, admin.password)) {
      try {
          const userToDelete = await prisma.user.findUnique({ where: { email } });
          if (!userToDelete) {
              return res.status(404).json({ success: false, message: 'User not found.' });
          }

          await prisma.user.delete({
              where: { email: email }
          });
          res.json({ success: true, message: 'User deleted successfully.' });
      } catch (error) {
          console.error('Error deleting user:', error);
          res.status(500).json({ success: false, message: 'Failed to delete user' });
      }
  } else {
      res.status(401).json({ success: false, message: 'Unauthorized: Incorrect password' });
  }
});



// userinfo.js or an appropriate router file
router.get('/viewUser/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
  });
  if (user) {
      res.render('viewUser', { user }); // You'll need to create a 'viewUser.ejs'
  } else {
      res.status(404).send('User not found');
  }
});




module.exports = router;
