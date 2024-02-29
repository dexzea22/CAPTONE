require("dotenv").config(); // This should be at the very top
const openai = require("openai-api");

var createError = require("http-errors");
const express = require("express");
const session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const paypal = require("paypal-rest-sdk");
const app = express();
const axios = require("axios");
const cors = require("cors");

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
var ordersRouter = require("./routes/orders");
var dietaryRouter = require("./routes/dietaryPreferences");
const profileRouter = require("./routes/profile");
const recommendationsRoute = require("./routes/recommendations");
const cartRouter = require("./routes/cart");

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8000 } = process.env;
const base = "https://api-m.sandbox.paypal.com";

// Correct usage with 'app'
app.get("/", (req, res) => {
  // Assume we have a function that gets recommendations.
  const recommendations = getRecommendationsForUser();
  res.render("recommendations", { recommendations });
});

paypal.configure({
  mode: "sandbox", // or 'live' for production
  client_id:
    "AVu3WborcTvCGiCezIWmlpoZl8aV3sREwYVeBrZAWl8Dej6WlLIY9mnfD527IwI4a6UbEIvWhlV4p8_o",
  client_secret:
    "EDx9Opa_MXiYn_Gi5ndrNPORMpStswHgSlc4gfCWs87JUSS1HamXSr169xX9Tg-80jkaVXZvyH8IHIob",
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
app.get("/cart", (req, res) => {
  res.render("cart"); // Render a view named "new-page.ejs"
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
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000, // 24 hours
    },
  })
);

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
    origin: "http://localhost:8000",
  })
);

app.use("/", loginRouter);
app.use("/", registerRouter);
app.use("/", confirmoderinfoRouter);
app.use("/", userinfoRouter);
app.use("/orders", ordersRouter);
app.use("/", dietaryRouter); // Use the dietary routes
app.use("/profile", profileRouter);
app.use("/recommendations", recommendationsRoute);
app.use("/cart", cartRouter);
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");
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

/**
 * Create an order to start the transaction.
 */
const createOrder = async (accessToken) => {
  try {
    const response = await fetch(
      "https://api.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "10.00",
              },
            },
          ],
        }),
      }
    );
    console.log(
      "Request Payload:",
      JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "10.00",
            },
          },
        ],
      })
    );

    if (!response.ok) {
      throw new Error(`Failed to create order. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Order created:", data);
    return data.id; // Assuming you want to return the created order ID
  } catch (error) {
    console.error("Failed to create order:", error.message);
    throw error; // Re-throw the error to propagate it up the call stack
  }
};

// Assuming this is part of the same module and makes a request to PayPal API
const makePayPalRequest = async (url, accessToken, payload) => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("PayPal request failed:", error.message);
    throw error; // Re-throw the error to propagate it up the call stack
  }
};

// Helper function to calculate total amount based on items in the cart
function calculateTotalAmount(cartItems) {
  let totalAmount = 0;
  for (const item of cartItems) {
    totalAmount += item.price * item.quantity;
  }
  return totalAmount;
}

/**
 * Capture payment for the created order to complete the transaction.
 */
const captureOrder = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

// Add a new route to create a PayPal order
app.post("/pay", async (req, res) => {
  try {
    const cartItems = req.session.cartItems; // Assuming you have cartItems stored in session
    const { jsonResponse, httpStatusCode } = await createOrder(cartItems);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order." });
  }
});

// Add a new route to capture the PayPal order
app.post("/capture/:orderID", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture PayPal order:", error);
    res.status(500).json({ error: "Failed to capture PayPal order." });
  }
});

//fetching Paypal activity
app.get("/adminserver", async (req, res) => {
  try {
    const accessToken =
      access_token$sandbox$xg86hwpmj9syfv6g$21a653745a7ffc3cce86f2797b84a28c; // Replace with your actual access token

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
