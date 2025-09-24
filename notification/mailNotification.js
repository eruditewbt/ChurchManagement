import { createTransport } from "nodemailer";
import User from "../model/User.js";
import { secrets } from "../getSecret.js";

const user = await secrets.MAIL_AUTH_USER;
const pass = await secrets.MAIL_AUTH_PASS;
// var transporter;

// Create a transporter object

const transporter = createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // or 'STARTTLS'
  auth: {
    user: user,
    pass: pass,
  },
});

// Function to send notifications
const sendNotification = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: user,
      to: to,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Notification sent successfully!");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// *Unit Notifications*

// To send notifications to units, you can modify the `sendNotification` function to accept an array of unit IDs or names, and then use a loop to send notifications to each unit's members:
const sendUnitNotification = async (unitId, subject, message) => {
  try {
    const unitMembers = await User.findAll({ where: { unitId: unitId } });
    unitMembers.forEach((member) => {
      sendNotification(member.EMAIL, subject, message);
    });
  } catch (error) {
    console.error("Error sending unit notification:", error);
  }
};

export { sendNotification, sendUnitNotification};
