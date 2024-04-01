const express = require('express');
const router = express.Router();
const session = require('express-session');
const app = express();
app.use(express.json());
const bcrypt = require('bcrypt');

const { PrismaClient } = require("@prisma/client");
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
router.get('/login', async function (req, res, next) {
  console.log('Session:', req.session);
  var users = await prisma.User.findMany();
  if (req.session.userId) {
      console.log('User logged in with userId:', req.session.userId);
      return res.redirect('/UserDashboard');
  } else {
      res.render('index', { title: 'Express', users: users });
  }
});

/* POST login page. */
router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;

  try {
      const user = await prisma.User.findUnique({
          where: { email: email },
      });

      if (!user) {
          return res.render('index', { errorMessage: 'Incorrect Email / Password.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          return res.render('index', { errorMessage: 'Incorrect Password.' });
      }

      // Set the userId in the session
      req.session.userId = user.id;

      // Redirect based on user type
      const redirectUrl = user.usertype === 'Admin' ? '/adminDashboard' :
          user.usertype === 'Manager' ? '/managerDashboard' :
              '/UserDashboard';
      return res.redirect(redirectUrl);
  } catch (error) {
      console.error('Error logging in:', error);
      return res.render('error', { errorMessage: 'Error logging in. Please try again.' });
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

/* Protected route for user meals */
router.get('/userMeals', authenticate, restrictAccess.bind(null, 'User'), async (req, res) => {
  try {
    // Your data retrieval logic for user meals goes here...
    // Example: const userMeals = await fetchUserMeals(req.session.userId);
    // Adjust this based on your actual implementation

    // Render the userMeals template with the retrieved data
    res.render('userMeals', { userMeals }); // Adjust this based on your actual implementation
  } catch (error) {
    console.error('Error fetching user meals:', error);
    res.status(500).send('Internal server error');
  }
});


app.use('/', router);
module.exports = app;