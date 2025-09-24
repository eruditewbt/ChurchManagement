// Register.js;

// Use flash messages for feedback after user registration. This ensures that success or error messages are displayed once and then cleared.
// routes/register.js
import { Router } from "express";
const router = Router();
import bcrypt from "bcryptjs";
import joi from "joi";
import { Op } from "sequelize";
import { v4 } from "uuid";

import User from "../model/User.js";
import { secrets } from "../getSecret.js";


// Route for the register page
router.get("/register", (req, res) => {
  const userId = req.query.userId;
  const notWorker = !req.session.isWorker;
  if (userId) {
    res.render("register", {
      userId: userId,
      notWorker: notWorker,
    });
  } else {
    res.render("register", {
    });
  }
});

// Route for handling user registration
router.post("/register", async (req, res) => {
  try {
    // Use joi.object, joi.string, etc. directly for compatibility
    const schema = joi.object({
      DATE: joi.date().required(),
      NAME: joi.string().required(),
      SEX: joi.string().valid("M", "F").required(),
      ADDRESS: joi.string().allow(""),
      FOLLOWUP: joi.string().allow(""),
      CAT: joi.string().valid("NC", "FT", "OLD MEMBER").required(),
      PHONENUMBER: joi.string().required(),
      PRAYER: joi.string().allow(""),
      EMAIL: joi.string().email().required(),
      CREATOR: joi.string().allow(""),
      UNIT: joi.string().allow(""),
      authToken: joi.string().allow(""),
    });

    //log
    console.log("User is been input validated");
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      req.flash("error_msg", messages);
      //log
      console.log("error_msg", messages);
      // return res.redirect("/register");
      return res.render("register", {
        error_msg: messages,
      });
    }


    console.log("User is been authorized");
    if (value.authToken !== secrets.AUTH_TOKEN) {
      req.flash("error_msg", "Invalid authorization token");
      //log
      console.log(
        "error_msg",
        "Invalid authorization token",
        value.authToken,
        secrets.AUTH_TOKEN
      );

      return res.render("register", {
        error_msg: "Invalid authorization token",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ NAME: value.NAME }, { PHONENUMBER: value.PHONENUMBER }],
      },
    });

    if (existingUser) {
      let message = "";
      if (
        existingUser.NAME === value.NAME &&
        existingUser.PHONENUMBER === value.PHONENUMBER
      ) {
        message = "A user with this name and phone number already exists.";
      } else if (existingUser.NAME === value.NAME) {
        message = "A user with this name already exists.";
      } else {
        message = "A user with this phone number already exists.";
      }
      //log
      console.log("error_msg", message);
      req.flash("error_msg", message);

      return res.render("register", {
        error_msg: message,
      });
    }

    const user = await User.create({
      DATE: value.DATE,
      NAME: value.NAME,
      SEX: value.SEX,
      ADDRESS: value.ADDRESS,
      FOLLOWUP: value.FOLLOWUP,
      CAT: value.CAT,
      PHONENUMBER: value.PHONENUMBER,
      PRAYER: value.PRAYER,
      EMAIL: value.EMAIL,
      CREATOR: value.CREATOR,
      UNIT: value.UNIT,
    });
    
    req.flash("success_msg", "User has been successfully registered!");
    // res.redirect("/register");
    console.log("User has been successfully registered!");
    console.log(value);
    return res.render("register", {
      success_msg: "User has been successfully registered!" + value.NAME,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("error_msg", "An internal error occurred.");
    // res.redirect("/register");
    return res.render("register", {
      error_msg: error,
    });
  }
});

export default router;
