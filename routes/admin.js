// admin route supports various features and performs administrative tasks.

// imports
import User from "../model/User.js";
import Activity from "../model/Activity.js";
import { Router } from "express";
const router = Router();


router.get("/admin/dashboard", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const users = await User.findAll();
    const activities = await Activity.findAll();
    res.render("admin/dashboard", {
      users,
      activities,
      agent: req.query.agent,
    });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading admin dashboard");
    res.redirect("/admin/login");
  }
});

// User management
router.get("/admin/users", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const users = await User.findAll();
    res.render("admin/users", { users });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading users");
    res.redirect("/admin/dashboard");
  }
});

// Activity monitoring
router.get("/admin/activities", async (req, res) => {
  try {
    // const agent = req.query.agent;
    // const agentData = agent.getData();
    // const Id = agentData.userId;

    // if (!Id) {
    //   req.flash("error_msg", "User id not found, log in properly ");
    //   return res.redirect("/login");
    //   // return res.status(404).send("User session not found.");
    // }
    const activities = await Activity.findAll();
    res.render("admin/activities", { activities });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading activities");
    res.redirect("/admin/dashboard");
  }
});

export default router;
