// Login.js;

// manage user sessions upon successful login and to use flash messages for user feedback. The login route now sets a session variable to track the authenticated user.
// routes/login.js
import { Router } from "express";
const router = Router();
import joi from "joi";
import UserAgent from "../model/Activity.js";
import User from "../model/User.js";
import { Op } from "sequelize";
import { v4 } from "uuid";

import { secrets } from "../getSecret.js";
import { DATE } from "sequelize";
import { secure, AgentService } from "../security/agent-service.js";
import { syncDatabase } from "../database/db_setup.js";
// import Agent from "../security/agent.js";



// Route for the login page
router.get("/login", (req, res) => {
  res.render("login", {
  });
});

// Route for handling login requests
router.post("/login", async (req, res) => {
  try {
    // const { firstName, phoneNumber, authToken } = req.body;

    const schema = joi.object({
      firstName: joi.string().required(),
      phoneNumber: joi.string().required(),
      authToken: joi.string().allow("").optional(),
    });
    //log
    console.log("validating name and phone/email");
    const { error, value } = schema.validate(req.body);
    if (error) {
      req.flash("error_msg", "First name or phone number cannot be empty.");
      //log
      console.log("error_msg", "First name or phone number cannot be empty.");
      // return res.redirect("/login");
      return res.render("login", {
        error_msg: "First name or phone number cannot be empty.",
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { PHONENUMBER: value.phoneNumber },
          { EMAIL: value.phoneNumber },
        ],
      },
    });

    if (!user) {
      req.flash("error_msg", "User does not exist. Please try again.");
      //log
      console.log("error_msg", "User does not exist. Please try again.");
      // return res.redirect("/login");
      return res.render("login", {
        error_msg: "User does not exist. Please try again.",
      });
    }

    // Compare all words in the user's name with the provided firstName (case-insensitive)
    const nameWords = user.NAME.split(" ").map((w) => w.toLowerCase());
    if (!nameWords.includes(value.firstName.toLowerCase())) {
      req.flash("error_msg", "Incorrect first name.");
      // log
      console.log("error_msg", "Incorrect first name.");
      // return res.redirect("/login");
      return res.render("login", {
        error_msg: "Incorrect first name.",
      });
    }

    // Set the user ID in the session upon successful login
    const timeStamp = new DATE();
    console.log(timeStamp);
    const userId = user.id;
    const ipAddress = req.ip;
    req.session.userId = userId;
    const userAgent = req.get("User-Agent");
    req.session.lastActivity = timeStamp;

    // check if agent exist
    const data = {
      userId: userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    // check if user exist
    const userAgentRecord = await UserAgent.findOne({
      where: { USERID: userId },
    });

    // create agent function
    async function createAgent(role) {
      if (userAgentRecord) {
        await userAgentRecord.update({
          IPADDRESS: ipAddress,
          USERAGENT: userAgent,
          LASTACTIVITY: timeStamp,
          ROLE: role,
          ISACTIVE: true,
          FAILEDCOUNT: 0,
        });
      } else {
        await UserAgent.create({
          USERID: userId,
          IPADDRESS: ipAddress,
          USERAGENT: userAgent,
          LASTACTIVITY: timeStamp,
          ROLE: role,
          ISACTIVE: true,
          FAILEDCOUNT: 0,
        });
      }
      const agent = AgentService.getAgentData(data, true, role, timeStamp);
      secure.allowedID.push(userId);
      req.flash("agent", agent);
      return agent;
    }

    if (value.authToken && value.authToken === secrets.ADMIN_AUTH_TOKEN) {
      // Admin login

      req.session.isWorker = true;
      req.session.isAdmin = true;
      req.session.role = "admin";
      const role = "admin";
      const agent = await createAgent(role);
      req.session.agent = agent;

      req.flash("success_msg", "Welcome, ADMIN! Login successful.");
      //log
      console.log(`Welcome, ${user.NAME.split(" ")[0]}! Login successful.`);
      console.log(value);
      return res.redirect(`/admin/dashboard?agent=${agent}`);
    } else if (
      value.authToken &&
      value.authToken === secrets.WORKER_AUTH_TOKEN
    ) {
      // Worker login
      req.session.isWorker = true;
      req.session.role = "worker";
      const role = "worker";
      const agent = await createAgent(role);
      req.session.agent = agent;

      req.flash("success_msg", "Welcome, Worker! Login successful.");
      //log
      console.log(`Welcome, ${user.NAME.split(" ")[0]}! Login successful.`);
      console.log(value);
      return res.redirect(`/dashboard?agent=${agent}`);
    } else if (!value.authToken) {
      // Member login
      req.session.isWorker = false;
      req.session.role = "member";
      const role = "member";
      const agent = await createAgent(role);
      req.session.agent = agent;

      req.flash(
        "success_msg",
        `Welcome, ${user.NAME.split(" ")[0]}! Login successful.`
      );
      // log
      console.log(`Welcome, ${user.NAME.split(" ")[0]}! Login successful.`);
      console.log(value);
      return res.redirect(`/memberIndex?agent=${agent}`);
    } else {
      req.flash("error_msg", "Invalid authorization token.");
      //log
      console.log("error_msg", "Invalid authorization token.");
      return res.render("login", {
        error_msg: "Invalid authorization token.",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("error_msg", "An internal server error occurred.");

    return res.render("login", {
      error_msg: "An internal server error occurred.",
    });
  }
});

// Logout route to destroy the session
router.get("/logout", async (req, res) => {
  var userId = req.session.userId;
  const agent = AgentService.getAgent(req);
  const agentData = agent.getData();
  if (!userId) {
    userId = agentData.userId;
  }
  if (userId) {
    const userAgentRecord = await UserAgent.findOne({
      where: { USERID: userId },
    });
    await userAgentRecord.destroy((err) => {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Could not Logged out Try again.");
        return res.redirect(req.get("referer") || "/login");
      }
    });
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        // req.flash("success_msg", "Could not Logged out Try again.");
        return res.redirect(req.get("referer") || "/login");
      }
      // req.flash("success_msg", "Logged out successfully.");
      res.redirect("/");
    });
  } else {
    req.flash("error_msg", "Could not Logged out Try again.");
    return res.redirect(req.get("referer") || "/login");
  }
});

export default router;
