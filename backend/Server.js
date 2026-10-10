const Order = require("./models/Order");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");
const PaymentRequest = require("./models/PaymentRequest");

const app = express();
app.use(express.json());


const allowedOrigins = [
  "https://growthgenie.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "SocialBoost API is running" });
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));


// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    balance: user.balance
  }
});

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});
// LOGIN API ends above this line


// PASTE YOUR /api/auth/me ROUTE HERE
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});


app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { serviceId, packageId, link, quantity } = req.body;

    const validServiceId = Number(serviceId);
    const validQuantity = Number(quantity);

    if (
      !Number.isInteger(validServiceId) ||
      !Number.isInteger(validQuantity) ||
      typeof link !== "string" ||
      !link.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a valid service, link and quantity"
      });
    }

    const serviceNames = {
      1: "Instagram Likes",
      2: "Instagram Views",
      3: "Instagram Shares",
      4: "Instagram Followers",
      5: "Instagram Comments",
      6: "YouTube Subscribers",
      7: "YouTube Likes",
      8: "YouTube Views",
      9: "YouTube Comments",
      10: "YouTube Watch Hours"
    };

    const serviceName = serviceNames[validServiceId];

    if (!serviceName) {
      return res.status(400).json({ message: "Invalid service" });
    }

    // Package prices are defined on the server, never trusted from the browser.
   
const packageCatalogue = {
  // Instagram Likes
  "101": { serviceId: 1, name: "Instagram Likes - Standard", rate: 14, min: 100, max: 100000 },
  "102": { serviceId: 1, name: "Instagram Likes - Premium", rate: 21, min: 100, max: 100000 },
  "103": { serviceId: 1, name: "Instagram Likes - Premium", rate: 28, min: 100, max: 100000 },

  // Instagram Views
  "201": { serviceId: 2, name: "Instagram Views - Standard", rate: 3, min: 100, max: 1000000 },
  "202": { serviceId: 2, name: "Instagram Views - Premium", rate: 4.5, min: 100, max: 1000000 },
  "203": { serviceId: 2, name: "Instagram Views - Premium", rate: 6, min: 100, max: 1000000 },

  // Instagram Shares
  "301": { serviceId: 3, name: "Instagram Shares - Standard", rate: 10, min: 100, max: 100000 },
  "302": { serviceId: 3, name: "Instagram Shares - Premium", rate: 15, min: 100, max: 100000 },
  "303": { serviceId: 3, name: "Instagram Shares - Premium", rate: 20, min: 100, max: 100000 },

  // Instagram Followers
  "6106": { serviceId: 4, name: "Instagram Indian Followers - Standard", rate: 251.54, min: 100, max: 100000 },
  "6107": { serviceId: 4, name: "Instagram Indian Followers - Premium", rate: 276.01, min: 100, max: 100000 },
  "6141": { serviceId: 4, name: "Instagram Indian Followers - 90 Day Refill", rate: 326.83, min: 100, max: 100000 },
  "6142": { serviceId: 4, name: "Instagram Indian Followers - 365 Day Refill", rate: 348.94, min: 100, max: 100000 },
  "6143": { serviceId: 4, name: "Instagram Indian Followers - Lifetime Refill", rate: 374.53, min: 100, max: 100000 },

  // Instagram Comments
  "501": { serviceId: 5, name: "Instagram Comments - Standard", rate: 50, min: 10, max: 10000 },
  "502": { serviceId: 5, name: "Instagram Comments - Premium", rate: 75, min: 10, max: 10000 },
  "503": { serviceId: 5, name: "Instagram Comments - Premium", rate: 100, min: 10, max: 10000 },

  // YouTube Subscribers
  "601": { serviceId: 6, name: "YouTube Subscribers - Standard", rate: 45, min: 100, max: 100000 },
  "602": { serviceId: 6, name: "YouTube Subscribers - Premium", rate: 67.5, min: 100, max: 100000 },
  "603": { serviceId: 6, name: "YouTube Subscribers - Premium", rate: 90, min: 100, max: 100000 },

  // YouTube Likes
  "701": { serviceId: 7, name: "YouTube Likes - Standard", rate: 20, min: 100, max: 100000 },
  "702": { serviceId: 7, name: "YouTube Likes - Premium", rate: 30, min: 100, max: 100000 },
  "703": { serviceId: 7, name: "YouTube Likes - Premium", rate: 40, min: 100, max: 100000 },

  // YouTube Views
  "801": { serviceId: 8, name: "YouTube Views - Standard", rate: 10, min: 100, max: 1000000 },
  "802": { serviceId: 8, name: "YouTube Views - Premium", rate: 15, min: 100, max: 1000000 },
  "803": { serviceId: 8, name: "YouTube Views - Premium", rate: 20, min: 100, max: 1000000 },

  // YouTube Comments
  "901": { serviceId: 9, name: "YouTube Comments - Standard", rate: 50, min: 10, max: 10000 },
  "902": { serviceId: 9, name: "YouTube Comments - Premium", rate: 75, min: 10, max: 10000 },
  "903": { serviceId: 9, name: "YouTube Comments - Premium", rate: 100, min: 10, max: 10000 },

  // YouTube Watch Hours
  "1001": { serviceId: 10, name: "YouTube Watch Hours - Standard", rate: 100, min: 10, max: 10000 },
  "1002": { serviceId: 10, name: "YouTube Watch Hours - Premium", rate: 150, min: 10, max: 10000 },
  "1003": { serviceId: 10, name: "YouTube Watch Hours - Premium", rate: 200, min: 10, max: 10000 }
};

    const selectedPackage = packageCatalogue[String(packageId)];

    if (
      !selectedPackage ||
      selectedPackage.serviceId !== validServiceId
    ) {
      return res.status(400).json({
        message: "Please select a valid package for this service"
      });
    }

    if (
      validQuantity < selectedPackage.min ||
      validQuantity > selectedPackage.max
    ) {
      return res.status(400).json({
        message: `Quantity must be between ${selectedPackage.min} and ${selectedPackage.max}`
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(link.trim());
    } catch {
      return res.status(400).json({
        message: "Please enter a valid link"
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Please enter a valid HTTP or HTTPS link"
      });
    }

    const price = Math.round(
      (validQuantity / 1000) * selectedPackage.rate * 100
    ) / 100;

    const user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        balance: { $gte: price }
      },
      {
        $inc: { balance: -price }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        message: "Insufficient balance. Please add funds first."
      });
    }

    try {
      const order = await Order.create({
        user: user._id,
        serviceId: validServiceId,
        packageId: String(packageId),
        packageName: selectedPackage.name,
        serviceName,
        link: parsedUrl.toString(),
        quantity: validQuantity,
        price,
        status: "Pending"
      });

      return res.status(201).json({
        message: "Order created successfully",
        order,
        balance: user.balance
      });
    } catch (orderError) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: price } }
      );

      throw orderError;
    }
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      message: "Unable to create order"
    });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error.message);

    res.status(500).json({
      message: "Unable to fetch orders"
    });
  }
});

app.post("/api/wallet/upi-request", authenticateToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const transactionId = String(
      req.body.transactionId || ""
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount < 1 ||
      amount > 10000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      return res.status(400).json({
        message: "Enter a valid amount between ₹1 and ₹10,000."
      });
    }

    if (
      transactionId.length < 6 ||
      transactionId.length > 100
    ) {
      return res.status(400).json({
        message: "Enter a valid UPI transaction/reference ID."
      });
    }

    const payment = await PaymentRequest.create({
      user: req.userId,
      amount,
      method: "UPI_QR",
      transactionId,
      status: "PENDING"
    });

    res.status(201).json({
      message: "Payment submitted for verification.",
      paymentRequest: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
  console.error("UPI request error:", error);

  res.status(500).json({
    message: "Unable to submit payment request.",
    details: error.message
  });
}
});
function requireAdmin(req, res, next) {
  User.findById(req.userId)
    .select("role")
    .then((user) => {
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          message: "Admin access required"
        });
      }

      next();
    })
    .catch((error) => {
      console.error("Admin authorization error:", error.message);
      res.status(500).json({
        message: "Authorization failed"
      });
    });
}

// ADD THE ADMIN STATS CODE HERE
app.get(
  "/api/admin/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      totalUsers,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load statistics"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});