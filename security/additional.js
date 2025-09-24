import session from "express-session";
import { getSecrets, secrets } from "../getSecret.js";
import rateLimit from "express-rate-limit";
import { generateSecret, totp } from "speakeasy";
import {
  createLogger,
  format as _format,
  transports as _transports,
} from "winston";
import UAParser from "ua-parser-js";
import geoip from "geoip-lite";

// Configure session middleware
const sessions = session({
  secret: secrets.SESSION_SECRET || "a_very_secret_key", // Use an environment variable for a real app
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  }, // Always false for local development
  // cookie: { secure: process.env.NODE_ENV === "production" }, // Secure cookies in production
});

// rate limiting to prevent brute-force attacks on your application
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//two-factor authentication with  `speakeasy`
// Generate a secret key for the user
const genSecret = () => {
  generateSecret({
    name: "Church Member Management",
  });
};
// Verify the user's one-time password
const verifySecret = (genSecret) => {
  return totp.verify({
    secret: genSecret.base32,
    encoding: "base32",
    token: userProvidedToken,
  });
};

//  *Activity Logging*`winston` to log activity.
const logger = createLogger({
  level: "info",
  format: _format.json(),
  transports: [new _transports.File({ filename: "activity.log" })],
});

// Log user activity

const middleLogger = (err, req, res, next) => {
  logger.info(
    `User ${req.userId} performed action ${req.method} ${req.url} --  ${err}`
  );
  next();
};

// *User Agent Fingerprinting* with `ua-parser-js`
function deviceToUserDetails(req) {
  const parser = new UAParser();
  parser.setUA(req.get("User-Agent"));
  const result = parser.getResult();
  return result;
}

function getLocation(req) {
  const geo = geoip.lookup(req.ip);
  // Use the user's location
  return geo;
}

//*User Agent Fingerprint:*
// {
//   "family": "Chrome",
//   "major": "89",
//   "minor": "0",
//   "patch": "4389",
//   "source": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
//   "os": {
//     "family": "Windows",
//     "major": "10",
//     "minor": null
//   },
//   "device": {
//     "family": "Other"
//   }
// }
// *Location-Based Authentication:*
// {
//   "range": [
//     167772160,
//     167774111
//   ],
//   "country": "US",
//   "region": "CA",
//   "city": "Mountain View",
//   "ll": [
//     37.4229,
//     -122.085
//   ],
//   "metro": 807,
//   "area": 1000
// }

export {
  sessions,
  limiter,
  genSecret,
  verifySecret,
  logger,
  middleLogger,
  deviceToUserDetails,
  getLocation,
};
