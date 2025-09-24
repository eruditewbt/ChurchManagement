// app.js

// imports
import { getSecrets, secrets } from "./getSecret.js";
import express from "express";
import path, { join } from "path";
import { fileURLToPath } from "url";
import hbs from "hbs";
import helmet from "helmet";
import session from "express-session";
import flash from "connect-flash";
import { syncDatabase, cipherDetails } from "./database/db_setup.js";


// // netlify setup serverless
// import serverless from 'serverless-http';


// Import all middleware before syncing database
import { sessions, limiter, middleLogger } from "./security/additional.js";
import { secure, AgentService } from "./security/agent-service.js";

// routes
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/register.js";
import dashboardRoutes from "./routes/dashboard.js";
import memberRoutes from "./routes/memberIndex.js";
import indexRoutes from "./routes/index.js";
import adminRoutes from "./routes/admin.js";
// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express app
const app = express();

// Use Helmet for basic security headers
app.use(helmet());

// Configure session middleware
app.use(sessions);

// configure limiter
app.use(limiter);

// configure logger
app.use(middleLogger);

// Use connect-flash for flash messages
app.use(flash());

// Middleware to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.agent = req.flash("agent");
  next();
});

// Configure Express to parse incoming JSON and URL-encoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up the view engine and views directory
app.set("view engine", "hbs");
app.set("views", join(__dirname, "views"));

// Register partials for reusable view components
hbs.registerPartials(join(__dirname, "views/partials"));

// Serve static files from the 'public' directory
const publicDir = join(__dirname, "public");
app.use(express.static(publicDir));

// Sync the database models
syncDatabase();
cipherDetails();

//  Use the UserAgent Middleware*
// Add the `trackUserActivity` middleware to your Express.js application:
// const secure = new AgentService();
app.use(secure.trackUserActivity);

// Use the imported routes with authentication protection where needed
// app.use(isAuthenticated);
app.use(indexRoutes);
app.use(loginRoutes);
app.use(registerRoutes);

const isMember = secure.isAuthorized(["member", "worker", "admin"]);
const isWorker = secure.isAuthorized(["worker", "admin"]);

const isAdmin = secure.isAuthorized(["admin"]);
const authenticateUser = secure.isAuthenticated;
const validate = secure.validateAgent;

// Protect the dashboard and member profile routes
app.use(authenticateUser, isMember, validate, memberRoutes);
app.use(authenticateUser, isWorker, validate, dashboardRoutes);
app.use(authenticateUser, isAdmin, validate, adminRoutes);

// app.use(memberRoutes);
// app.use(dashboardRoutes);
// app.use(adminRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    req.flash("error_msg", "An unexpected error occurred. Please try again.");
    res.status(500).redirect(req.originalUrl); // Redirect back with an error message
  }
  next();
});

// Set the listening port and start the server
const PORT = secrets.PORT || 5000;
// const server =
app.listen(PORT, () => {
  console.log(`Server started on port localhost:${PORT}`);
});

// // Handling unhandled promise rejections
// process.on("unhandledRejection", (err) => {
//   console.log(`An unhandled rejection occurred: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// export default app;
module.exports.handler = serverless(app);
