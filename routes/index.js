const express = require('express');
const router = express.Router();

const app = express();
app.use(express.json());
const bcrypt = require('bcrypt');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


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



// Add this route to handle the root path
router.get('/', (req, res) => {
  return res.redirect('/login');
});

/* GET home page. */
router.get('/login', async function (req, res) {
  if (req.isAuthenticated()) {  // Checks if the user is already authenticated
    console.log('User already logged in, redirecting to dashboard:', req.user.id);
    return res.redirect('/UserDashboard');
  } else {
    console.log('Rendering login page.');
    res.render('index', { title: 'Login' });
  }
});


// POST login route for handling login
app.post('/login', async function (req, res) {
  const { email, password } = req.body;
  try {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          console.log('Login failed for user:', email);
          return res.status(401).render('index', { errorMessage: 'Incorrect Email or Password.' });
      }
      
      // Use Passport's req.login to handle session setup
      req.login(user, (err) => {
          if (err) {
              console.error('Session login failed:', err);
              return res.status(500).render('error', { errorMessage: 'Session setup failed.' });
          }

          console.log('Login successful, redirecting to:', user.usertype === 'Admin' ? '/adminDashboard' :
              user.usertype === 'Manager' ? '/managerDashboard' : '/UserDashboard');

          // Redirect based on user type
          return res.redirect(user.usertype === 'Admin' ? '/adminDashboard' :
              user.usertype === 'Manager' ? '/managerDashboard' : '/UserDashboard');
      });
  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).render('error', { errorMessage: 'Error logging in. Please try again.' });
  }
});






router.get('/logout', async (req, res) => {
  try {
    req.session.destroy();
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

/* Protected routes */
router.get('/adminDashboard', authenticate, restrictAccess.bind(null, 'Admin'), async (req, res) => {
  try {
    const users = await prisma.User.findMany();
    return res.render('adminDashboard', { title: 'Admin Page', users: users });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

router.get('/managerDashboard', authenticate, restrictAccess.bind(null, 'Manager'), async (req, res) => {
  try {
    const users = await prisma.User.findMany();
    return res.render('managerDashboard', { title: 'Manager Page', users: users });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});


router.get('/logs', authenticate, restrictAccess.bind(null, 'Admin'), (req, res) => {
  prisma.log.findMany()
    .then((logs) => {
      return res.render('logs', { logs });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    });
});


// Protected route for adminUserTable
router.get('/adminUserTable', authenticate, restrictAccess.bind(null, 'Admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch users from database
    res.render('adminUserTable', { title: 'User Table', users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});
// Admin Transaction History route
router.get('/adminTransactionHistory', authenticate, restrictAccess.bind(null, 'Admin'), (req, res) => {
  prisma.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          foodItem: true
        }
      }
    }
  })
    .then((orders) => {
      res.render('adminTransactionHistory', { orders });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    });
});


router.post('/logAction', async (req, res) => {
  const { action, email } = req.body;

  try {
    await prisma.log.create({
      data: {
        action,
        email,
        timestamp: new Date(),
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/setDeleteEmail', (req, res) => {
  const { email } = req.body;
  req.session.deleteEmail = email;
  return res.sendStatus(200);
});





router.get('/UserDashboard', authenticate, restrictAccess.bind(null, 'User'), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(404).send('User not found');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).send('User not found');
    }
    
    let welcomeMessage = "Welcome!";
    if (user.firstName) {
      welcomeMessage = "Welcome " + user.firstName + "!";
    }
    
    return res.render('UserDashboard', { 
      title: 'User Page', 
      user: user,
      welcomeMessage: welcomeMessage
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});



// POST route for handling email submission for password reset
router.post('/forgotPassword', async function(req, res) {
  const { email } = req.body;

  try {
    // Check if the user exists with the provided email
    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      // Handle case where email does not exist in the database
      return res.render('forgotPassword', { errorMessage: 'Email not found.' });
    }

    // Generate and send password reset instructions (e.g., email with reset link)
    // Here, you would typically generate a unique token, save it to the user's document in the database,
    // and send an email with a link containing this token.

    // Example token generation using a hypothetical library or function
    const resetToken = generateResetToken(); // Replace with your actual token generation logic

    // Example of saving the reset token and expiration time to the user's document in the database
    await prisma.user.update({
      where: { email: email },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 3600000), // Token expires in 1 hour (adjust as needed)
      },
    });

    // Example of sending an email with password reset instructions
    const resetLink = `http://yourdomain.com/resetPassword/${resetToken}`; // Replace with your actual domain
    await sendResetEmail(email, resetLink); // Implement this function using Nodemailer or another email service

    // Render the forgotPassword page with a success message
    return res.render('forgotPassword', { successMessage: 'Password reset instructions sent to your email.' });

  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).render('error', { errorMessage: 'Error in forgot password. Please try again later.' });
  }
});


app.use('/', router);
module.exports = app;