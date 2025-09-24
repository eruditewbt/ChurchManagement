import UserAgent from "../model/UserAgent.js";
import axios from "axios";
import { v4 } from "uuid";

function redirector(url, method) {
  // const url = req.url;
  const reqGet = method == "GET";
  const isUrl = url === "/" || url === "/login" || url === "/register";
  if (isUrl && reqGet) {
    return true;
  } else {
    return false;
  }
}

// function redirector(req) {
//   // const url = req.url;
//   const reqGet = req.method == "GET";
//   const isUrl = req.url === "/" || url === "/login" || url === "/register";
//   if (isUrl && reqGet) {
//     return true;
//   } else {
//     return false;
//   }
// }




function middleCorrect(middleware, req) {
  const userId = req.session.userId || "id";
  const url = req.url;
  const isUrl = url === "/" || url === "/login" || url === "/register";
  const skipAuthorize =
    url === "/" ||
    url === "/login" ||
    url === "/register" ||
    url === "/memberIndex" ||
    url === `/update-user/${userId}`;
  const reqGet = req.method == "GET";
  const skipLogin = url === "/login";
  console.log(url, isUrl, reqGet, userId, skipAuthorize);
  switch (middleware) {
    case "authenticate":
      if (isUrl && reqGet) {
        return true;
      }
    case "authorize":
      if (skipAuthorize) {
        return true;
      }
    case "track":
      if (skipLogin && reqGet) {
        return true;
      }
    default:
      console.log("No match found, middleware will execute process");
      return false;
  }
}

// Authentication Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  // Check if a user ID is stored in the session
  const userId = req.session?.userId || false;
  if (userId) {
    next();
  } else {
    req.flash("error_msg", "Please log in to view resource.");
    const url = req.originalUrl;
    if (url === "/" || url === "/login" || url === "/register") {
      next();
    } else {
      return res.redirect(req.get("referer") || "/login");
    }
  }
};

// const isAuthorized = (req, res, next) => {
//   try {
//     const nt = middleCorrect("authorize", req, next);
//     if (nt) {
//       return next();
//     }
//     const roles = "worker";
//     const role = req.session.role;

//     console.log(role, roles);
//     if (role) {
//       if (roles == role) {
//         return next();
//       }
//     }
//     req.flash("error_msg", "You do not have permission to view this resource.");
//     console.log("invalid role");
//     return res.redirect("/access-denied");
//   } catch (error) {
//     console.error(error);
//     req.flash("error_msg", "Internal server error");
//     return res.redirect(req.get("referer") || "/");
//   }
// };

// Middleware to check if user is authorized
const isAuthorized = (roles) => {
  return (req, res, next) => {
    const nt = middleCorrect("authorize", req, next);
    if (nt) {
      return next();
    }
    const userId = req.session?.userId || false;
    const role = req.session.role;

    if (userId && role) {
      console.log(role, roles);
      if (roles.includes(role)) {
        next();
      } else {
        req.flash(
          "error_msg",
          "You do not have permission to view this resource."
        );
        console.log("invalid role");
        req.flash("error_msg", "invalid role");
        res.redirect("/access-denied");
      }
    } else {
      console.log("invaliduser agent");
      req.flash("error_msg", "no session found");
      res.redirect("/access-denied");
    }
  };
};

// const isAdmin = isAuthorized(["admin"]);
// const isWorker = isAuthorized(["worker", "admin"]);

// the `/access-denied` route renders the `access-denied` template with a 403 Forbidden status code.

// *Using Middleware to Redirect to the Error Page*

// You can use middleware to redirect to the error page when an authorization or authentication rule is violated. Here's an example:

const authenticate = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/access-denied");
  }
  next();
};

// a middleware function to track user activities and update the User Agent model:

const trackUserActivity = async (req, res, next) => {
  const nt = middleCorrect("authenticate", req, next);
  if (nt) {
    return next();
  }
  try {
    //track if user is authenticated
    const userId = req.session.userId || false;
    const ipAddress = req.ip;
    // const timeStamp = new Date();
    const userAgent = req.get("User-Agent");
    const role = req.session.role;
    const lastActivity = req.session.lastActivity;

    //if user is not authenticated
    if (!userId) {
      const userAgentRecord = await UserAgent.findOne({
        where: {
          IPADDRESS: req.ip,
          USERAGENT: req.get("User-Agent"),
          ROLE: null,
          ISACTIVE: false,
        },
      });

      if (userAgentRecord) {
        if (userAgentRecord.FAILEDCOUNT >= 10) {
          req.flash(
            "error_msg",
            "Unauthorized Your Request has been banned please contact our customer service ."
          );

          return res.redirect("/access-denied");
        }

        req.session.userId = userAgentRecord.USERID;

        // return next(); // else just some un registerd user
        const nt = redirector(req.url, req.method);
        if (nt) {
          return next();
        } else {
          return res.redirect(req.get("referer") || "/login");
        }
      } else {
        // create a new userAgent
        const id = v4();
        await UserAgent.create({
          USERID: id,
          IPADDRESS: ipAddress,
          USERAGENT: userAgent,
          FAILEDCOUNT: 0,
          ROLE: null,
          LASTACTIVITY: null,
        });
        req.session.userId = id;
        req.session.role = null;
        req.session.lastActivity = null;
      }
      // return next(); // No user, skip tracking
      const nt = redirector(req.url, req.method);
      if (nt) {
        return next();
      } else {
        return res.redirect(req.get("referer") || "/login");
      }
    } else if (userId) {
      const userAgentRecord = await UserAgent.findOne({
        where: {
          USERID: userId,
        },
      });

      if (userAgentRecord) {
        if (userAgentRecord.FAILEDCOUNT >= 10) {
          req.flash(
            "error_msg",
            "Unauthorized Your Request has been banned please contact our customer service ."
          );
          // redirector(res, req, next);
          return res.redirect("/access-denied");
        }
        // req.session.role = userAgentRecord.ROLE;
        const fails = userAgentRecord.FAILEDCOUNT + 1;
        if (
          role !== userAgentRecord.ROLE ||
          lastActivity !== userAgentRecord.LASTACTIVITY ||
          ipAddress !== userAgentRecord.IPADDRESS ||
          userAgent !== userAgentRecord.UserAgent
        ) {
          await userAgentRecord.update({
            FAILEDCOUNT: fails,
          });
          req.flash(
            "error_msg",
            `Unauthorized Please log in properly to view this resource. tried ${fails} of 10`
          );
          const nt = redirector(req.url, req.method);
          if (nt) {
            return next();
          } else {
            return res.redirect(req.get("referer") || "/login");
          }
        }
        return next();
      } else {
        // create a new userAgent
        const id = v4();
        await UserAgent.create({
          USERID: id,
          IPADDRESS: ipAddress,
          USERAGENT: userAgent,
          FAILEDCOUNT: 1,
          ROLE: null,
          LASTACTIVITY: null,
        });
        req.session.userId = id;
        req.session.role = null;
        req.session.lastActivity = null;
        req.flash(
          "error_msg",
          `Unauthorized Please log in properly to view this resource. tried 1 of 10`
        );
        const nt = redirector(req.url, req.method);
        if (nt) {
          return next();
        } else {
          return res.redirect(req.get("referer") || "/login");
        }
      }
    }
    const nt = redirector(req.url, req.method);
    if (nt) {
      return next();
    } else {
      return res.redirect(req.get("referer") || "/login");
    }
  } catch (error) {
    console.error(error);
    return next();
  }
};

const trackUserActivity0 = async (req, res, next) => {
  try {
    // Only track if user is authenticated
    var userId = req.session.userId || false;
    if (!userId) {
      const userAgentRecord = await UserAgent.findOne({
        where: {
          IPADDRESS: req.ip,
          USERAGENT: req.get("User-Agent"),
        },
      });
      if (userAgentRecord) {
        userId = userAgentRecord.USERID;
        req.session.userId = userId;
        req.session.role = userAgentRecord.ROLE;
      }
      next(); // No user, skip tracking
    }
    const ipAddress = req.ip;
    const timeStamp = new Date();
    const userAgent = req.get("User-Agent");
    const userAgentRecord = await UserAgent.findOne({
      where: { USERID: userId },
    });
    if (!userAgentRecord) {
      await UserAgent.create({
        USERID: userId,
        IPADDRESS: ipAddress,
        USERAGENT: userAgent,
      });
    }
    userId = userAgentRecord.USERID;
    req.session.userId = userId;
    req.session.role = userAgentRecord.ROLE;
    // req.session.lastActivity = timeStamp;
    next();
  } catch (error) {
    console.error(error);
    next();
  }
};

//Authenticate and Authorize*

// Use the User Agent model to authenticate and authorize users. You can create a custom authentication middleware that checks the User Agent record and verifies the user's identity:
const authenticateUser = async (req, res, next) => {
  try {
    const nt = middleCorrect("authenticate", req, next);
    if (nt) {
      return next();
    }
    const userId = req.session.userId || false;
    const role = req.session.role;
    const lastActivity = req.session.lastActivity;
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");
    if (!userId || !role) {
      req.flash("error_msg", "Unauthorized: No user session found.");
      // return res
      //   .status(401)
      //   .json({ error_msg: "Unauthorized: No user session found." });
      return res.redirect(req.get("referer") || "/");
    }
    return next();
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Internal Server Error" + error);
    return res.redirect(req.get("referer") || "/");
  }
};

// Location

// {
//   "city": "New York",
//   "region": "New York",
//   "country": "USA",
//   "latitude": 40.7128,
//   "longitude": -74.0060
// }

const getUserLocation = async (ipAddress) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateUserAgentLocation = async (userAgentId, ipAddress) => {
  try {
    const location = await getUserLocation(ipAddress);
    await UserAgent.update({ location }, { where: { id: userAgentId } });
  } catch (error) {
    console.error(error);
  }
};

export {
  authenticate,
  authenticateUser,
  trackUserActivity,
  updateUserAgentLocation,
  isAuthenticated,
  isAuthorized,
  // isAdmin,
  // isWorker,
};
