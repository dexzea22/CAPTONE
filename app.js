var createError = require('http-errors');
const express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const app = express();

const port = process.env.PORT || 8000;


var loginRouter = require('./routes/index');
var registerRouter = require('./routes/register');
var confirmoderinfoRouter = require('./routes/confirmoderinfo');
var userinfoRouter = require('./routes/userinfo');
var ordersRouter = require('./routes/orders');
var dietaryRouter = require('./routes/dietaryPreferences');
var profileRouter = require('./routes/profile');


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Serve the "Menu" page
app.get('/menu', (req, res) => {
  res.render('menu'); // Render the "menu.ejs" template
});
// Serve the "Trays" page
app.get('/trays', (req, res) => {
  res.render('trays'); // Render the "trays.ejs" template
});
// Serve the "Meals" page
app.get('/meals', (req, res) => {
  res.render('meals'); // Render the "meals.ejs" template
});
app.get('/userMenu', (req, res) => {
  res.render('userMenu'); // Render a view named "new-page.ejs"
});
app.get('/userTrays', (req, res) => {
  res.render('userTrays'); // Render a view named "new-page.ejs"
});
app.get('/userMeals', (req, res) => {
  res.render('userMeals'); // Render a view named "new-page.ejs"
});
app.get('/profile', (req, res) => {
  res.render('profile'); // Render a view named "new-page.ejs"
});

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000 // 24 hours
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);
app.use('/', registerRouter);
app.use('/', confirmoderinfoRouter);
app.use('/', userinfoRouter);
app.use('/orders', ordersRouter);
app.use('/', dietaryRouter); // Use the dietary routes
app.use('/profile', profileRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  // Check if the user is already on the root path to avoid redirect loop
  if (req.session.userId && req.path !== '/') {
    return res.redirect('/');
  }

  res.render('error');
});


// error handler
app.use(function(err, req, res, next) {
  // Check here to see if you're unintentionally catching a legitimate request
  console.error(err);

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;