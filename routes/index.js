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
  if (req.session.userId) {
    try {
      const user = await prisma.User.findUnique({
        where: { id: req.session.userId },
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

router.post('/deleteUser', async (req, res) => {
  const { password } = req.body;
  const deleteEmail = req.session.deleteEmail;

  try {
    const loggedInUserId = req.session.userId;
    const loggedInUser = await prisma.user.findUnique({
      where: { id: loggedInUserId },
    });

    if (!loggedInUser) {
      return res.json({ success: false, message: 'User not found.' });
    }

    // Compare the password of the logged-in admin user with the provided password
    const match = await bcrypt.compare(password, loggedInUser.password);
    if (!match) {
      return res.json({ success: false, message: 'Incorrect password.' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { email: deleteEmail.toLowerCase() },
      include: { student: true }, // Include the associated student info
    });

    if (!userToDelete) {
      return res.json({ success: false, message: 'User not found.' });
    }

    // Log the delete action before performing the deletion
    await prisma.log.create({
      data: {
        action: 'Delete',
        email: deleteEmail,
        timestamp: new Date(),
      },
    });

    // Delete the associated student info
    if (userToDelete.student) {
      await prisma.student_Info.delete({
        where: { id: userToDelete.student.id },
      });
    }

    // Delete the user from the database
    await prisma.user.delete({
      where: { email: deleteEmail.toLowerCase() },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.get('/UserDashboard', authenticate, restrictAccess.bind(null, 'User'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await prisma.User.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    let welcomeMessage = "Welcome!";
    if (user && user.firstName) {
      welcomeMessage = "Welcome " + user.firstName + "!";
    }
    
    return res.render('UserDashboard', { 
      title: 'User Page', 
      user: user,
      welcomeMessage: welcomeMessage // This line sends the message to your front-end
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});




app.use('/', router);
module.exports = app;