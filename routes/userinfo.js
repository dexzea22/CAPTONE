const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');


router.get('/adminUserTable', async (req, res) => {
    try {
        // Fetch only users who are not anonymized
        const users = await prisma.user.findMany({
            where: {
                NOT: {
                    email: {
                        startsWith: 'anonymized_'
                    }
                }
            }
        });
        res.render('adminUserTable', { title: 'User Info', users });
    } catch (error) {
        console.error('Error fetching non-anonymized users:', error);
        res.status(500).send('Error fetching users');
    }
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

// Handle updating user data including password
router.post('/updateUser/:userId', async (req, res) => {
    const { email, usertype, password } = req.body;

    try {
        let updatedUserData = { email, usertype };

        // Check if a new password is provided
        if (password) {
            // Hash the new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            updatedUserData.password = hashedPassword;
        }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: req.params.userId },
            data: updatedUserData
        });

        res.status(200).json({ success: true, message: 'User data updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Failed to update user data.' });
    }
});


router.post('/deleteUser', async (req, res) => {
    const { email, adminPassword } = req.body;

    // Fetch admin details for authentication
    const admin = await prisma.user.findUnique({ where: { email: 'admin123@gmail.com' } });
    if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    if (!bcrypt.compareSync(adminPassword, admin.password)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Incorrect password' });
    }

    try {
        // Anonymize user data
        await prisma.user.update({
            where: { email },
            data: {
                email: `anonymized_${new Date().getTime()}@example.com`,
                password: null,
                firstName: 'Anonymized',
                lastName: 'User',
                address: null,
                phoneNumber: null,
                // Other fields to anonymize
            }
        });

        console.log('User data anonymized successfully.');
        res.json({ success: true, message: 'User data anonymized successfully.' });
    } catch (error) {
        console.error('Error anonymizing user:', error);
        res.status(500).json({ success: false, message: 'Failed to anonymize user' });
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
