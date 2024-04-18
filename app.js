require("dotenv").config(); // This should be at the very top
const openai = require("openai-api");
const { PrismaClient } = require('@prisma/client'); // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

const fetch = require("node-fetch"); // Import fetch module for making HTTP requests

var createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const flash = require('express-flash');
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const paypal = require("paypal-rest-sdk");
const app = express();
const axios = require("axios");
const cors = require("cors");
const MongoStore = require('connect-mongo');
const port = process.env.PORT || 8000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Now you can access the API key
const openaiApi = new openai(OPENAI_API_KEY);
const {
  revised_generated_recommendation,
} = require("./utils/revisedGenerateRecommendation");

var loginRouter = require("./routes/index");
var registerRouter = require("./routes/register");
var confirmoderinfoRouter = require("./routes/confirmoderinfo");
var userinfoRouter = require("./routes/userinfo");

var dietaryRouter = require("./routes/dietaryPreferences");
const profileRouter = require("./routes/profile");
const recommendationsRoute = require("./routes/recommendations");
const cartRouter = require("./routes/cart");
const orderRouter = require('./routes/orderRoutes');

const adminOrderStatusRouter = require('./routes/adminOrderStatusRouter');
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8000 } = process.env;
const base = "https://api-m.sandbox.paypal.com";
app.use(flash());
// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
  }),
  cookie: {
    maxAge: 86400000, // 24 hours
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  }
}));

// Correct usage with 'app'
app.get("/", (req, res) => {
  // Assume we have a function that gets recommendations.
  const recommendations = getRecommendationsForUser();
  res.render("recommendations", { recommendations });
});

paypal.configure({
  mode: "sandbox", // or 'live' for production
  client_id: PAYPAL_CLIENT_ID,
  client_secret: PAYPAL_CLIENT_SECRET,
});

// test recommendation
app.get("/revised_recommendation", async (req, res) => {
  const response3 = await revised_generated_recommendation({
    vegetarian: false,
    vegan: false,
    omnivore: false,
    halal: false,
    kosher: false,
    lactoseFree: false,
    glutenFree: false,
    nutAllergy: true,
    otherRestrictions: "",
  });

  res.json({ message3: response3 });
});

// Serve the "Menu" page
app.get("/menu", (req, res) => {
  res.render("menu"); // Render the "menu.ejs" template
});
// Serve the "Trays" page
app.get("/trays", (req, res) => {
  res.render("trays"); // Render the "trays.ejs" template
});
// Serve the "Meals" page
app.get("/meals", (req, res) => {
  res.render("meals"); // Render the "meals.ejs" template
});
app.get("/userMenu", (req, res) => {
  res.render("userMenu"); // Render a view named "new-page.ejs"
});
app.get("/userTrays", (req, res) => {
  res.render("userTrays"); // Render a view named "new-page.ejs"
});
app.get("/userMeals", (req, res) => {
  res.render("userMeals"); // Render a view named "new-page.ejs"
});

app.get("/aboutUs", (req, res) => {
  res.render("aboutUs"); // Render a view named "new-page.ejs"
});
// Route to display user order history
app.get('/orderHistory', authenticate, async (req, res) => {
  try {
    // Fetch order history data from the database based on the logged-in user
    const orders = await prisma.order.findMany({
      where: {
        userId: req.session.userId
      },
      include: {
        orderItems: true,
      },
    });

    // Render EJS template with order history data
    res.render('orderHistory', { orders });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Define route handler to render orderStatus.ejs template
app.get('/orderStatus', authenticate, async (req, res) => {
  try {
    // Fetch order status data from the database based on the logged-in user
    const orders = await prisma.order.findMany({
      where: {
        userId: req.session.userId,
        NOT: [{ status: 'Completed' }, { status: 'Delivered' }] // Exclude orders with statuses 'Completed' and 'Delivered'
      },
      include: {
        orderItems: true,
      },
    });

    // Verify that the orders array is correctly filtered
    console.log('Filtered Orders:', orders);

    // Render the orderStatus.ejs template with the filtered orders data
    res.render('orderStatus', { orders });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/userOrder', authenticate, (req, res) => {
  res.render('userOrder');
});


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

app.get('/cart', authenticate, async (req, res) => {
  try {
      const userId = req.session.userId;
      if (!userId) {
          return res.status(401).json({ message: 'User not authenticated.' });
      }
      const cartItems = await prisma.cartItem.findMany({
          where: { userId: userId },
          include: { foodItem: true },
      });
      // Render the cart template and pass the cartItems data to it
      res.render('cart', { cartItems });
  } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ message: 'Failed to fetch cart items.', error: error.message });
  }
});

app.get("/recommendation", (req, res) => {
  res.render("recommendation"); // Render a view named "new-page.ejs"
});
app.get("/about", (req, res) => {
  res.render("about"); // Render a view named "new-page.ejs"
});
app.get("/contactUs", (req, res) => {
  res.render("contactUs"); // Render a view named "new-page.ejs"
});
app.get("/contact", (req, res) => {
  res.render("contact"); // Render a view named "new-page.ejs"
});




// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use("/", loginRouter);
app.use("/", registerRouter);
app.use("/", confirmoderinfoRouter);
app.use("/", userinfoRouter);

app.use("/", dietaryRouter); // Use the dietary routes
app.use("/profile", profileRouter);
app.use("/recommendations", recommendationsRoute);
app.use("/api/cart", cartRouter);
app.use('/orders', orderRouter);

app.use('/adminOrderStatus', adminOrderStatusRouter);

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error.message);
    throw error; // Re-throw the error to propagate it up the call stack
  }
};

// Create an order to start the transaction
const createOrder = async (cartItems) => {
  try {
    const accessToken = await generateAccessToken(); // Retrieve PayPal access token
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "PHP",
              value: calculateTotalAmount(cartItems).toFixed(2), // Calculate total amount from cart items
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Order created:", data);
    return data.id; // Return the created order ID
  } catch (error) {
    console.error("Failed to create order:", error.message);
    throw error;
  }
};

const captureOrder = async (orderId, cartItems, userId, shippingAddress, contactPerson, contactNumber, paymentMethod) => {
  try {
    let order;

    if (paymentMethod === 'PayPal') {
      const accessToken = await generateAccessToken(); // Retrieve PayPal access token
      const url = `${base}/v2/checkout/orders/${orderId}/capture`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shippingAddress: shippingAddress,
          contactPerson: contactPerson,
          contactNumber: contactNumber
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to capture PayPal order. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("PayPal Order captured:", data);

      // Save order details to the database for PayPal order
      order = await prisma.order.create({
        data: {
          userId: userId,
          paypalOrderId: orderId,
          status: 'PENDING', // Set a default status here
          amount: calculateTotalAmount(cartItems),
          paymentMethod: 'PayPal', // Set payment method as PayPal
          shippingAddress: shippingAddress,
          createdAt: new Date(),
          contactPerson: contactPerson,
          contactNumber: contactNumber,
          orderItems: {
            create: cartItems.map(item => ({
              itemId: item.itemId,
              itemName: item.foodItem.name,
              itemDescription: item.foodItem.description,
              itemPrice: item.foodItem.price,
              itemSize: item.foodItem.size,
              itemImageUrl: item.foodItem.imageUrl,
              quantity: item.quantity,
              totalPrice: item.quantity * item.foodItem.price,
            }))
          }
        },
      });
    } else if (paymentMethod === 'COD') {
      // Save order details to the database for Cash On Delivery (COD) order
      order = await prisma.order.create({
        data: {
          userId: userId,
          status: 'PENDING', // Set a default status here
          amount: calculateTotalAmount(cartItems),
          paymentMethod: 'COD', // Set payment method as Cash On Delivery
          shippingAddress: shippingAddress,
          createdAt: new Date(),
          contactPerson: contactPerson,
          contactNumber: contactNumber,
          orderItems: {
            create: cartItems.map(item => ({
              itemId: item.itemId,
              itemName: item.foodItem.name,
              itemDescription: item.foodItem.description,
              itemPrice: item.foodItem.price,
              itemSize: item.foodItem.size,
              itemImageUrl: item.foodItem.imageUrl,
              quantity: item.quantity,
              totalPrice: item.quantity * item.foodItem.price,
            }))
          }
        },
      });
    } else {
      throw new Error('Invalid payment method.');
    }

    console.log("Order and OrderItems saved to database:", order);

     // Optionally, you can remove the cart items after the order is captured
    await prisma.cartItem.deleteMany({
      where: {
        userId: userId,
      },
    });

    return order;
  } catch (error) {
    console.error("Failed to capture order:", error);
    throw error;
  }
};




// Helper function to calculate total amount based on items in the cart
function calculateTotalAmount(cartItems) {
  let totalAmount = 0;
  for (const item of cartItems) {
    totalAmount += item.foodItem.price * item.quantity; // Access the price from foodItem
  }
  return totalAmount;
}


// Function to create a PayPal order with intent set to "AUTHORIZE"
const createPayPalOrder = async (cartItems) => {
  try {
    const accessToken = await generateAccessToken(); // Retrieve PayPal access token
    const totalAmount = calculateTotalAmount(cartItems).toFixed(2);

    // Construct the request body with intent set to "AUTHORIZE"
    const requestBody = {
      intent: "AUTHORIZE", // Change intent to AUTHORIZE
      purchase_units: [{
        amount: {
          currency_code: "PHP",
          value: totalAmount
        }
      }]
    };

    // Log the request body
    console.log("PayPal Order Request Body:", requestBody);

    // Send request to create order
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to create PayPal order. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("PayPal Order Response:", data);
    
    return data.id; // Return the created order ID
  } catch (error) {
    console.error("Failed to create PayPal order:", error.message);
    throw error;
  }
};


// Route to create a PayPal order
app.post("/pay", async (req, res) => {
  try {
    // Create PayPal order
    const orderId = await createPayPalOrder(req.session.cartItems);

    // Send response
    res.status(200).json({ orderId });
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order." });
  }
});

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

// Route to capture a PayPal or COD order
app.post("/capture/:orderId", authenticate, async (req, res) => {
  try {
    const { orderId } = req.params; // Retrieve orderId from route params

    // Retrieve cart items from session
    const cartItems = req.session.cartItems || [];
    const userId = req.session.userId;

    // Extract shipping address, contact person, contact number, and payment method from request body
    const { shippingAddress, contactPerson, contactNumber, paymentMethod } = req.body;

    // Log cartItems for verification
    console.log("Cart Items:", cartItems);

    // Capture order based on payment method
    let capturedOrder;
    if (paymentMethod === 'PayPal') {
      capturedOrder = await captureOrder(orderId, cartItems, userId, shippingAddress, contactPerson, contactNumber, paymentMethod);
    } else if (paymentMethod === 'COD') {
      capturedOrder = await captureOrder(orderId, cartItems, userId, shippingAddress, contactPerson, contactNumber, paymentMethod);
    } else {
      throw new Error("Invalid payment method");
    }

    // Log capturedOrder for verification
    console.log("Captured Order:", capturedOrder);

    // Ensure user information exists in the session
    if (req.session && req.session.userId && req.session.email) {
      // Create a log entry for the captured payment
      await prisma.log.create({
        data: {
          action: `Payment captured for order ${orderId}`,
          email: req.session.email,
          userId: req.session.userId,
        },
      });

      // Send response
      res.status(200).json({ message: "Order captured successfully" });
    } else {
      console.error("Failed to capture order: User information not found in session");
      res.status(500).json({ error: "Failed to capture order: User information not found in session" });
    }
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});










//fetching Paypal activity
app.get("/adminserver", async (req, res) => {
  try {
    const accessToken = access_token$sandbox$xg86hwpmj9syfv6g$21a653745a7ffc3cce86f2797b84a28c; // Replace with your actual access token

    const fromDate = req.query.fromDate || "2023-01-01";
    const toDate = req.query.toDate || "2023-12-31";

    const response = await axios.get(
      "https://api-m.sandbox.paypal.com/v1/reporting/transactions",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          start_date: fromDate,
          end_date: toDate,
          // Include any necessary parameters for your specific reporting needs
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("PayPal reporting request failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
