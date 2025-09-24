import { Router } from "express";
const router = Router();
import User from "../model/User.js";
import Activity from "../model/Activity.js";
import joi from "joi";
import {AgentService} from "../security/agent-service.js";

// Route for "memberIndex" page
// This route is for individual "members" and displays their personal information and activities.
router.get("/memberIndex", async (req, res) => {
  try {
    // const { userId } = req.params;
    var userId = req.session.userId;
    
    if (!userId) {
      const agent = AgentService.getAgent(req);
      const agentData = agent.getData();
      userId = agentData.userId;
    }

    if (!userId) {
      req.flash("error_msg", "User id not found, log in properly ");
      return res.redirect("/login");
      // return res.status(404).send("User session not found.");
    }

    // Find a single user by their ID
    const user = await User.findByPk(userId);

    if (!user) {
      req.flash("error_msg", "User not found.");
      return res.status(404).send("User not found.");
    }

    req.session.userId = user.id;
    req.session.unit = user.UNIT;
    req.session.isWorker = false;
    // Find all activities associated with this user
    const userActivities = await Activity.findAll({
      where: { USERID: userId },
      order: [
        ["DATE", "DESC"],
        ["TIME", "DESC"],
      ],
    });

    // Render the memberIndex view with the user's data and their activities
    res.render("memberIndex", {
      user: user.toJSON(),
      activities: userActivities.map((activity) => activity.toJSON()),
      agent: req.query.agent,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    req.flash(
      "error_msg",
      "An error occurred while fetching user information."
    );
    res.status(500).send("An error occurred while fetching user information.");
  }
});

// Store the previously stored location
const storedLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
};

// Function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = R * c;
  const distanceInMeters = distanceInKm * 1000;

  return distanceInMeters;
}

// Create activity route
router.post("/create-activity/:userId/:activityType", async (req, res) => {
  try {
    const location = req.query.location;
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    if (location.latitude) {
      const distance = calculateDistance(
        storedLocation.latitude,
        storedLocation.longitude,
        location.latitude,
        location.longitude
      );

      if (distance <= 500) {
        console.log("User is nearby");
        req.flash("success_msg", "Welcome To Church");
      } else {
        console.log("User is not nearby");
        req.flash(
          "error_msg",
          "You're not in church, you can't mark attendance"
        );
        return res.send({
          error_msg: "You're not in church, you can't mark attendance",
        });
      }
    }
    const { userId, activityType } = req.params;
    const { response } = req.body;

    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    console.log("create-activity 1");
    const currentUser = req.session.userId;
    //checking for authentication
    if (currentUser !== userId && !req.session.isWorker) {
      console.log("invalid authentication you are not allowed to access this");
      req.flash(
        "error_msg",
        "invalid authentication you are not allowed to access this"
      );
      return res.send({
        error_msg: "invalid authentication you are not allowed to access this",
      });
    }

    console.log("create-activity 2");
    const user = await User.findByPk(currentUser);
    if (!user) {
      console.log("User not found.");
      req.flash("error_msg", "User not found.");
      return res.status(404).send((error_msg = "User not found."));
    }

    console.log("create-activity 3");
    const activity = await Activity.create({
      USERID: userId,
      PERFORMER: user.NAME,
      ACTIVITYTYPE: activityType,
      DATE: currentDate,
      TIME: currentTime,
      RESPONSE: response,
    });

    console.log("Activity created successfully");
    req.flash("success_msg", "Activity created successfully");
    res.send({ success_msg: "Activity created successfully" });
  } catch (error) {
    console.error("Error creating activity:", error);
    req.flash("success_msg", "An error occurred while creating activity.");
    res
      .status(500)
      .send((error_msg = "An error occurred while creating activity."));
  }
});

// Update user
// Route for updating user data

// Route for the register page
router.get("/update-user", (req, res) => {
  const userId = req.query.userId;
  const notWorker = !req.session.isWorker;
  if (userId) {
    res.render("update-user", {
      // error_msg: req.flash("error_msg"),
      // success_msg: req.flash("success_msg"),
      userId: userId,
      notWorker: notWorker,
    });
  } else {
    res.render("update-user", {
      // error_msg: req.flash("error_msg"),
      // success_msg: req.flash("success_msg"),
    });
  }
});

router.post("/update-user/:userId", async (req, res) => {
  // authenticateUser()
  // const agent = req.query.agent;
  // const agentData = agent.getData();
  // const Id = agentData.userId;

  // if (!Id) {
  //   req.flash("error_msg", "User id not found, log in properly ");
  //   return res.redirect("/login");
  //   // return res.status(404).send("User session not found.");
  // }
  try {
    const { userId } = req.params;
    const schema = joi.object({
      DATE: joi.date().required(),
      NAME: joi.string().required(),
      SEX: joi.string().valid("M", "F"),
      ADDRESS: joi.string().allow(""),
      FOLLOWUP: joi.string().allow(""),
      CAT: joi.string().valid("NC", "FT", "OLD MEMBER").required(),
      PHONENUMBER: joi.string().required(),
      PRAYER: joi.string().allow(""),
      EMAIL: joi.string().email(),
      CREATOR: joi.string(),
      UNIT: joi.string(),
    });
    console.log("1");
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      req.flash("error_msg", messages);
      // return res.status(400).json({ error_msg: messages });
      res.render("update-user");
    }

    console.log("authentication");
    if (req.session.userId !== userId && !req.session.isWorker) {
      console.log("invalid authentication you are not allowed to access this");
      req.flash(
        "error_msg",
        "invalid authentication you are not allowed to access this"
      );
      // return res.status(404).json({
      //   error_msg: "invalid authentication you are not allowed to access this",
      // });
      res.render("update-user");
    }

    console.log("finding user by id");
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash("error_msg", "User not found");
      // return res.status(404).json({ error_msg: "User not found" });
      res.render("update-user");
    }

    await user.update(value);
    console.log("sucess in updating");
    req.flash("success_msg", "User updated successfully");
    res.redirect("/memberIndex");
  } catch (error) {
    console.error("Error updating user:", error);
    req.flash("error_msg", "Internal server error");
    res.status(500).json({ error_msg: "Internal server error" });
  }
});

export default router;
