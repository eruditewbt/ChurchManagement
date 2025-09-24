// routes/index.js
import { Router } from "express";
const router = Router();
import User from "../model/User.js";
import Activity from "../model/Activity.js";
import { Sequelize } from "sequelize";
import multer from "multer"; // Package for handling file uploads
import pkg from "exceljs";
const { Workbook } = pkg; // Package for reading Excel files
import joi from "joi";
// QUERIES FOR STAT
import { findUsersByMonthAndSortByFollowUp } from "../database/db_queries.js";
//QUERIS FOR Notification
import {
  sendNotification,
  sendUnitNotification,
} from "../notification/mailNotification.js";
import { secrets } from "../getSecret.js";


// Set up Multer for file uploads
const upload = multer({
  dest: "uploads/", // temporary directory to store uploaded files
});


// Route to get all user activities
router.get("/activities/users/:userId", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const { userId } = req.params;
    // Find all activities associated with this user
    const userActivities = await Activity.findAll({
      where: { USERID: userId },
      order: [
        ["DATE", "DESC"],
        ["TIME", "DESC"],
      ],
    });
    if (!userActivities) {
      return res.status(404).json({
        message: "An error occurred while fetching user information.",
      });
    }

    res.json({
      activities: userActivities.map((activity) => activity.toJSON()),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("An error occurred while fetching user information.");
  }
});

// A function to handle rendering the index page with all necessary data
const renderDashboard = async (res, message = null) => {
  try {
    const users = await User.findAll({
      order: [["NAME", "ASC"]],
    });
    const units = await User.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("UNIT")), "unit"]],
      where: { UNIT: { [Sequelize.Op.not]: null } },
    });
    const activities = await Activity.findAll({
      order: [
        ["DATE", "DESC"],
        ["TIME", "DESC"],
      ],
    });
    res.render("dashboard", {
      users: users.map((user) => user.toJSON()),
      units: units.map((unit) => unit.toJSON()),
      activities: activities.map((activity) => activity.toJSON()),
      agent: req.query.agent, // Pass a message to the view, e.g., for success/failure
    });
  } catch (error) {
    console.error("Error fetching data for index view:", error);
    res.status(500).send("An error occurred while fetching data.");
  }
};

// GET route for the dashboard page
router.get("/dashboard", (req, res) => {
  // const agent = req.query.agent;
  // const agentData = agent.getData();
  // const Id = agentData.userId;

  // if (!Id) {
  //   req.flash("error_msg", "User id not found, log in properly ");
  //   return res.redirect("/login");
  //   // return res.status(404).send("User session not found.");
  // }
  renderDashboard(res);
});

// POST route to handle Excel file uploads
router.post("/upload-excel", upload.single("excelFile"), async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    if (!req.file) {
      return renderIndex(res, "No file uploaded. Please select a file.");
    }
    // Read the uploaded file using the exceljs package
    const workbook = new Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    // Convert the worksheet to JSON format
    const data = [];
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers.push(cell.value);
    });
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row
      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
      });
      data.push(rowData);
    });
    // Define a Joi schema for validating the incoming Excel data
    const schema = joi.object({
      DATE: joi.date(),
      NAME: joi.string().required(),
      SEX: joi.string().valid("M", "F").required(),
      ADDRESS: joi.string().allow(""),
      FOLLOWUP: joi.string().allow(""),
      CAT: joi.string().valid("NC", "FT", "OLD MEMBER").required(),
      PHONENUMBER: joi.string().required(),
      PRAYER: joi.string().allow(""),
      EMAIL: joi.string().email().allow(""),
      CREATOR: joi.string().allow(""),
      UNIT: joi.string().allow(""),
    });
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      // If validation fails, return an error message to the user
      const messages = error.details.map((d) => d.message).join("; ");
      return renderIndex(res, `Validation Error: ${messages}`);
    }
    // Use Sequelize's bulkCreate to insert all valid records at once
    await User.bulkCreate(value);
    // Re-render the index page with a success message
    renderIndex(res, "Excel sheet data has been successfully uploaded!");
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    renderIndex(res, "An error occurred while uploading the file.");
  } finally {
    // Clean up the temporary file
    if (req.file && req.file.path) {
      const fs = require("fs");
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }
  }
});

// Members Statistics
// Using findUsersByMonthAndSortByFollowUp in dbquery.js
// *Route:*
router.get("/member-statistics", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const totalMembers = await User.count();
    const activeMembers = await User.count({
      where: { lastLogin: { [Op.gte]: Date.now() - 30 * 24 * 60 * 60 * 1000 } },
    });
    const memberGrowth = await User.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
    });
    const recentMembers = await findUsersByMonthAndSortByFollowUp();
    res.render("member-statistics", {
      totalMembers,
      activeMembers,
      memberGrowth,
      recentMembers,
    });
  } catch (error) {
    console.error("Error fetching member statistics:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Call the `sendNotification` function whenever you want to send a notification, such as when a new event is created or updated:
router.post("/events", async (req, res) => {
  try {
    // const event = await Event.create(req.body);
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const email = req.query.email;
    await sendNotification(
      email,
      "Dont forget to come to service on sunday",
      // `Event: ${event.name}`
      `Event: LFC Lagere Remainder`
    );
    res.status(201).json({ error_msg: "error sending notification" });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// searrching for members
//  search routes
router.get("/search-members", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const query = req.query.q;

    const members = await User.find({
      where: {
        [Op.or]: [
          { NAME: { [Op.like]: `%${query}%` } },

          { UNIT: { [Op.like]: `%${query}%` } },

          { EMAIL: { [Op.like]: `%${query}%` } },

          { PHONENUMBER: { [Op.like]: `%${query}%` } },
        ],
      },
    });

    res.render("search-members", { members, query });
  } catch (error) {
    console.error("Error searching members:", error);

    res.status(500).send((error_msg = "Internal Server Error"));
  }
});

// advance search
router.get("/advanced-search-members", async (req, res) => {
  // const agent = req.query.agent;
  // const agentData = agent.getData();
  // const Id = agentData.userId;

  // if (!Id) {
  //   req.flash("error_msg", "User id not found, log in properly ");
  //   return res.redirect("/login");
  //   // return res.status(404).send("User session not found.");
  // }
  try {
    const unit = req.query.unit;
    const membershipLevel = req.query.membershipLevel;
    const status = req.query.status;

    const members = await User.find({
      where: {
        UNIT: unit,
        MEMBERSHIP_LEVEL: membershipLevel,
        STATUS: status,
      },
    });
    res.render("advanced-search-members", { members });
  } catch (error) {
    console.error("Error searching members:", error);
    res.status(500).send((error_msg = "Internal Server Error"));
  }
});

// Unit fetch
// using findUsersByUnit(unitName) in dbquery.js
// Unit routes
router.get("/unit/:unitName", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const unitName = req.params.unitName;
    const users = await findUsersByUnit(unitName);
    if (!req.session.isWorker) {
      // Fetch user unit only
      const units = [unitName];
      if (req.session.unit !== unitName) {
        console.error(" A member fetching unauthorized unit:", unitName);
        res.status(500).send((error_msg = "Internal Server Error"));
      } else {
        return res.render("unit", { users, unitName, units });
      }
    } else {
      const units = []; //  list of all units
      return res.render("unit", { users, unitName, units });
    }
  } catch (error) {
    console.error("Error fetching users by unit:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
