if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const isProd = process.env.NODE_ENV === "production";
const frontendUrl = isProd ? (process.env.FRONTEND_URL || "https://glowspark-store.onrender.com") : "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: isProd ? [frontendUrl, "http://localhost:5173"] : ["http://localhost:5173", frontendUrl],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible in routers/controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected via socket.io:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError= require("./utils/ExpressError.js");
const MongoStore = require('connect-mongo');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const User = require("./models/user.js");

// Routes
const authRouter = require("./routes/auth.js");
const productsRouter = require("./routes/product.js");
const reviewsRouter = require("./routes/review.js");
const cartRouter = require("./routes/cart.js");
const orderRouter = require("./routes/order.js");
const adminRouter = require("./routes/admin.js");
const userRouter = require("./routes/user.js");
const couponRouter = require("./routes/coupon.js");

const dbURL = process.env.ATLASDB_URL; 

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

// CORS setup to allow frontend to communicate with backend
app.use(cors({
  origin: isProd ? [frontendUrl, "http://localhost:5173"] : ["http://localhost:5173", frontendUrl],
  credentials: true,
}));

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api", limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Essential for REST API JSON parsing
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto : {
    secret : process.env.SECRET
  },
  touchAfter : 24*60*60,
})

store.on("error", (err) => {
  console.log(" error in MONGO-SESSION store ",err);
});
app.set("trust proxy", 1);
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false, // Don't create sessions for unauthenticated requests
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  }
};


app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// Use email as the username field
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Fallback to checking by email if exists
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            isVerified: true
          });
          await user.save();
        }
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'mock_app_id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'mock_app_secret',
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      if (!user) {
        // Fallback to checking by email if exists
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (email) {
            user = await User.findOne({ email: email });
        }
        if (user) {
          user.facebookId = profile.id;
          await user.save();
        } else {
          user = new User({
            facebookId: profile.id,
            email: email || `${profile.id}@facebook.com`,
            isVerified: true
          });
          await user.save();
        }
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

app.use((req,res,next)  => {
  res.locals.currUser = req.user || null;
  next();
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/products/:id/reviews", reviewsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/coupons", couponRouter);

// 404 API Error
app.all("*", (req,res,next) => {
  next(new ExpressError(404,"API Endpoint Not Found"));
});

// Global API Error Handler
app.use((err,req,res,next) => {
  let {statusCode = 500, message = "Something went wrong!"} = err;
  res.status(statusCode).json({
    success: false,
    message: message
  });
});

server.listen(8080, () => {
  console.log("API Server is listening to port 8080");
});