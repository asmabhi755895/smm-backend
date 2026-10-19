const Order = require("./models/Order");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");
const PaymentRequest = require("./models/PaymentRequest");
const SupportTicket = require("./models/SupportTicket");
const WalletTransaction = require("./models/WalletTransaction");
const PlatformSettings = require("./models/PlatformSettings");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
const app = express();
app.use(express.json());


const allowedOrigins = [
  "https://growthgenie.netlify.app",
  "https://aishwaryakart.store",
  "https://www.aishwaryakart.store",
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

 // GOOGLE LOGIN
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required."
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Google account could not be verified."
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          message: "This email is linked to a different Google account."
        });
      }

      // Don't silently link an existing password account.
      if (!user.googleId) {
        return res.status(409).json({
          message: "This email already has an account. Please log in with your password first."
        });
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        balance: 0,
        role: "user"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      message: "Google sign-in failed. Please try again."
    });
  }
});


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
    const userForSubscription = await User.findById(req.userId);

if (!userForSubscription) {
  return res.status(404).json({
    message: "User not found"
  });
}

if (userForSubscription.subscriptionActive !== true) {
  return res.status(403).json({
    code: "SUBSCRIPTION_REQUIRED",
    message: "Please purchase the ₹100 lifetime subscription before placing orders."
  });
}
 const platformSettings = await PlatformSettings.findOne();

if (platformSettings && platformSettings.ordersEnabled === false) {
  return res.status(503).json({
    message: "New orders are temporarily disabled. Please try again later.",
  });
}

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

// Service catalogue — keep IDs and rates synchronized with
// frontend/src/data/services.js
const serviceCatalogue = {
  1: { platform: "Instagram", category: "Likes", rate: 2.6, min: 100, max: 100000 },
  2: { platform: "Instagram", category: "Views", rate: 0.02, min: 100, max: 1000000 },
  3: { platform: "Instagram", category: "Shares", rate: 1.4, min: 100, max: 100000 },
  4: { platform: "Instagram", category: "Followers", rate: 23, min: 100, max: 100000 },
  5: { platform: "Instagram", category: "Comments", rate: 42.21, min: 10, max: 10000 },

  6: { platform: "YouTube", category: "Subscribers", rate: 37, min: 100, max: 100000 },
  7: { platform: "YouTube", category: "Likes", rate: 14.53, min: 100, max: 100000 },
  8: { platform: "YouTube", category: "Views", rate: 10.13, min: 100, max: 1000000 },
  9: { platform: "YouTube", category: "Comments", rate: 62.3, min: 10, max: 10000 },
  10: { platform: "YouTube", category: "Watch Hours", rate: 100, min: 10, max: 10000 },

  11: { platform: "Instagram", category: "Story Views", rate: 12.4, min: 100, max: 100000 },
  12: { platform: "Instagram", category: "Profile Visits", rate: 1.9, min: 100, max: 100000 },

  13: { platform: "Facebook", category: "Page Followers", rate: 15.14, min: 100, max: 100000 },
  14: { platform: "Facebook", category: "Profile Followers", rate: 17.53, min: 100, max: 100000 },
  15: { platform: "Facebook", category: "Likes", rate: 4.1, min: 100, max: 100000 },
  16: { platform: "Facebook", category: "Views", rate: 0.12, min: 100, max: 1000000 },
  17: { platform: "Facebook", category: "Comments", rate: 50, min: 10, max: 10000 },
  18: { platform: "Facebook", category: "Shares", rate: 6.2, min: 100, max: 100000 },
  19: { platform: "Facebook", category: "Story Views", rate: 3.24, min: 100, max: 100000 },

  20: { platform: "Telegram", category: "Channel Members", rate: 32, min: 100, max: 100000 },
  21: { platform: "Telegram", category: "Group Members", rate: 27.5, min: 100, max: 100000 },
  22: { platform: "Telegram", category: "Post Views", rate: 1.24, min: 100, max: 1000000 },
  23: { platform: "Telegram", category: "Post Reactions", rate: 1.88, min: 100, max: 100000 },
  24: { platform: "Telegram", category: "Post Shares", rate: 2.5, min: 100, max: 100000 },
  25: { platform: "Telegram", category: "Comments", rate: 20.2, min: 10, max: 10000 },
};


const service = serviceCatalogue[validServiceId];

if (!service) {
  return res.status(400).json({ message: "Invalid service" });
}

const serviceName = `${service.platform} ${service.category}`;

const packageOptions = [
  {
    suffix: "01",
    quality: "HQ",
    delivery: "Gradual Delivery",
    refill: "No Refill",
    label: "HQ",
    multiplier: 1,
  },
  {
    suffix: "02",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "30 Days Refill",
    label: "30 Days Refill",
    multiplier: 1.3,
  },
  {
    suffix: "03",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "90 Days Refill",
    label: "90 Days Refill",
    multiplier: 1.5,
  },
];

function getPackageName(serviceId, category, option) {
  if (serviceId === 4) {
    if (option.suffix === "01") {
      return "HQ Indian Followers - Standard";
    }

    if (option.suffix === "02") {
      return "HQ Indian Followers - 30 Days Refill";
    }

    return "HQ Indian Followers - 90 Days Refill";
  }

  if (serviceId === 6 && option.suffix === "01") {
    return "HQ YouTube Subscribers";
  }

  return `${category} - ${option.label}`;
}

const packageCatalogue = {};

for (const [id, item] of Object.entries(serviceCatalogue)) {
  for (const option of packageOptions) {
    const serviceId = Number(id);
    const packageId = `${id}${option.suffix}`;

    packageCatalogue[packageId] = {
      serviceId,
      name: getPackageName(serviceId, item.category, option),
      rate:
        Math.round(item.rate * option.multiplier * 100) / 100,
      min: item.min,
      max: item.max,
    };
  }
}
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

await WalletTransaction.create({
  user: user._id,
  type: "ORDER_PAYMENT",
  amount: price,
  description: `Payment for ${serviceName}`,
  status: "COMPLETED",
  reference: String(order._id),
  balanceAfter: user.balance
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

app.get(
  "/api/admin/orders",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      res.json({ orders });
    } catch (error) {
      console.error("Admin orders error:", error.message);
      res.status(500).json({
        message: "Unable to fetch admin orders"
      });
    }
  }
);

app.patch(
  "/api/admin/orders/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const status = String(req.body.status || "");

      const allowedStatuses = [
        "Pending",
        "Processing",
        "Completed",
        "Cancelled",
      ];

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      res.json({
        message: "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error("Admin order status error:", error);

      res.status(500).json({
        message: "Unable to update order status.",
      });
    }
  }
);

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

app.get("/api/wallet/transactions", authenticateToken, async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({
      user: req.userId
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ transactions });
  } catch (error) {
    console.error("Wallet transaction history error:", error.message);
    res.status(500).json({
      message: "Unable to load transaction history."
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

  const orders = await Order.find().lean();

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.price || 0),
    0
  );

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue
  });
} catch (error) {
  console.error("Admin stats error:", error);

  res.status(500).json({
    message: "Failed to load admin statistics"
  });
}

});

app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .lean();

      res.json({ users });
    } catch (error) {
      console.error("Admin users error:", error);

      res.status(500).json({
        message: "Failed to load users."
      });
    }
  }
);

app.patch(
  "/api/admin/users/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const name = String(req.body.name || "").trim();
      const email = String(req.body.email || "").trim().toLowerCase();

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }

      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required.",
        });
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "That email is already used by another account.",
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({
        message: "User updated successfully.",
        user,
      });
    } catch (error) {
      console.error("Admin user update error:", error);
      res.status(500).json({ message: "Unable to update user." });
    }
  }
);
// Admin: adjust a user's wallet balance
// Admin: adjust a user's wallet balance safely
app.patch(
  "/api/admin/users/:id/balance",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    let session;

    try {
      const { id } = req.params;
      const amount = Number(req.body.amount);
      const reason = String(req.body.reason || "").trim();
      const type = String(req.body.type || "");

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
      ) {
        return res.status(400).json({
          message: "Enter a valid amount with at most 2 decimal places.",
        });
      }

      if (!["ADD", "DEDUCT"].includes(type)) {
        return res.status(400).json({
          message: "Choose Add or Deduct.",
        });
      }

      if (!reason || reason.length > 200) {
        return res.status(400).json({
          message: "Enter a reason of at most 200 characters.",
        });
      }

      session = await mongoose.startSession();

      let updatedUser;

      await session.withTransaction(async () => {
        const change = type === "ADD" ? amount : -amount;

        const filter =
          type === "ADD"
            ? { _id: id }
            : { _id: id, balance: { $gte: amount } };

        const user = await User.findOneAndUpdate(
          filter,
          { $inc: { balance: change } },
          {
            new: true,
            runValidators: true,
            session,
          }
        ).select("-password -__v");

        if (!user) {
          const exists = await User.exists({ _id: id }).session(session);

          const error = new Error(
            exists
              ? "Insufficient wallet balance for this deduction."
              : "User not found."
          );

          error.status = exists ? 400 : 404;
          throw error;
        }

        await WalletTransaction.create(
          [
            {
              user: user._id,
              type: type === "ADD" ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
              amount,
              description: `Admin adjustment: ${reason}`,
              status: "COMPLETED",
              reference: `ADMIN-${new mongoose.Types.ObjectId()}`,
              balanceAfter: user.balance,
            },
          ],
          { session }
        );

        updatedUser = user;
      });

      return res.json({
        message: "Wallet balance updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Admin balance adjustment error:", error);

      if (error.status) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Unable to update balance. No changes should be committed if the transaction failed.",
      });
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

/* ========== ADMIN PLATFORM SETTINGS ========== */

// Get platform settings (admin only)
app.get(
  "/api/admin/settings",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      let settings = await PlatformSettings.findOne();

      if (!settings) {
        settings = await PlatformSettings.create({
          platformName: "SocialBoost",
          supportEmail: "",
          ordersEnabled: true,
          maintenanceMode: false,
        });
      }

      res.json({ settings });
    } catch (error) {
      console.error("Load platform settings error:", error.message);
      res.status(500).json({
        message: "Unable to load platform settings.",
      });
    }
  }
);

// Update platform settings (admin only)
app.patch(
  "/api/admin/settings",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        platformName,
        supportEmail,
        ordersEnabled,
        maintenanceMode,
      } = req.body;

      if (
        typeof platformName !== "string" ||
        !platformName.trim() ||
        platformName.trim().length > 80
      ) {
        return res.status(400).json({
          message: "Platform name must be between 1 and 80 characters.",
        });
      }

      if (
        typeof supportEmail !== "string" ||
        supportEmail.length > 254
      ) {
        return res.status(400).json({
          message: "Please enter a valid support email.",
        });
      }

      if (
        typeof ordersEnabled !== "boolean" ||
        typeof maintenanceMode !== "boolean"
      ) {
        return res.status(400).json({
          message: "Invalid order or maintenance setting.",
        });
      }

      const email = supportEmail.trim();

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({
          message: "Please enter a valid support email.",
        });
      }

      const settings = await PlatformSettings.findOneAndUpdate(
        {},
        {
          $set: {
            platformName: platformName.trim(),
            supportEmail: email,
            ordersEnabled,
            maintenanceMode,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({
        message: "Platform settings saved successfully.",
        settings,
      });
    } catch (error) {
      console.error("Save platform settings error:", error.message);
      res.status(500).json({
        message: "Unable to save platform settings.",
      });
    }
  }
);

/* ========== SUPPORT TICKET ROUTES ========== */

// Create a support ticket
app.post("/api/support/tickets", authenticateToken, async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required."
      });
    }

    if (subject.length > 100 || message.length > 2000) {
      return res.status(400).json({
        message: "Subject must be at most 100 characters and message at most 2000."
      });
    }

    const ticket = await SupportTicket.create({
      user: req.userId,
      subject,
      message
    });

    res.status(201).json({
      message: "Support ticket created successfully.",
      ticket
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);
    res.status(500).json({ message: "Unable to create support ticket." });
  }
});


// Get the logged-in user's tickets
app.get("/api/support/tickets", authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ tickets });
  } catch (error) {
    console.error("Fetch tickets error:", error.message);
    res.status(500).json({ message: "Unable to fetch support tickets." });
  }
});


// Get one ticket (owner or admin only)
app.get("/api/support/tickets/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid ticket ID." });
    }

    const ticket = await SupportTicket.findById(req.params.id).lean();

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const user = await User.findById(req.userId).select("role");

    if (
      String(ticket.user) !== String(req.userId) &&
      (!user || user.role !== "admin")
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Fetch ticket error:", error.message);
    res.status(500).json({ message: "Unable to fetch ticket." });
  }
});


// Add a reply to a ticket (owner or admin)
app.post(
  "/api/support/tickets/:id/replies",
  authenticateToken,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid ticket ID." });
      }

      const message = String(req.body.message || "").trim();

      if (!message || message.length > 2000) {
        return res.status(400).json({
          message: "Reply is required and must be at most 2000 characters."
        });
      }

      const ticket = await SupportTicket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found." });
      }

      const user = await User.findById(req.userId).select("role");
      const isAdmin = user && user.role === "admin";
      const isOwner = String(ticket.user) === String(req.userId);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied." });
      }

      if (ticket.status === "Resolved" && !isAdmin) {
        return res.status(400).json({
          message: "This ticket is resolved. Please create a new ticket."
        });
      }

      ticket.replies.push({
        sender: req.userId,
        senderRole: isAdmin ? "admin" : "user",
        message
      });

      if (isAdmin && ticket.status === "Open") {
        ticket.status = "In Progress";
      }

      await ticket.save();

      res.json({
        message: "Reply added successfully.",
        ticket
      });
    } catch (error) {
      console.error("Add ticket reply error:", error.message);
      res.status(500).json({ message: "Unable to add reply." });
    }
  }
);


// Admin: list all support tickets
app.get(
  "/api/admin/support/tickets",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const tickets = await SupportTicket.find()
        .populate("user", "name email")
        .sort({ updatedAt: -1 })
        .lean();

      res.json({ tickets });
    } catch (error) {
      console.error("Admin ticket list error:", error.message);
      res.status(500).json({ message: "Unable to fetch support tickets." });
    }
  }
);


// Admin: update ticket status
app.patch(
  "/api/admin/support/tickets/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid ticket ID." });
      }

      const status = String(req.body.status || "");

      if (!["Open", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid ticket status." });
      }

      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found." });
      }

      res.json({
        message: "Ticket status updated successfully.",
        ticket
      });
    } catch (error) {
      console.error("Update ticket status error:", error.message);
      res.status(500).json({ message: "Unable to update ticket status." });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});