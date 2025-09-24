import { Router } from "express";
const router = Router();
import NotificationSubscription from "../model/NotificationSubscription.js";
import { sendNotification } from "../notification/webNotification.js";
import { v4 } from "uuid";

// Route for the base URL (home page)
router.get("/", (req, res) => {
  res.render("index", { date: new Date().getFullYear() });
});

// *Step 3: Subscribe to Push Notifications*

const saveSubscription = async (ip, subscription) => {
  try {
    const existingSubscription = await NotificationSubscription.findOne({
      where: { USERID: ip },
    });
    if (existingSubscription) {
      await existingSubscription.update({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        expirationTime: subscription.expirationTime,
      });
    } else {
      await NotificationSubscription.create({
        // userId,
        USERID: ip,
        ENDPOINT: subscription.endpoint,
        KEYS: subscription.keys,
        EXPIRATIONTIME: subscription.expirationTime,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// Use the `saveSubscription` function to save the notification subscription when a user subscribes:
router.post("/subscribe", async (req, res) => {
  try {
    const userId = req.userId || v4(); //|| "Not signed in";
    const subscription = req.body;
    await saveSubscription(userId, subscription);
    res.json({ success_msg: "success", userId: userId});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_msg: "Internal Server Error" });
  }
});

// *Step 5: Trigger Push Notifications*

// Trigger push notifications when needed:
router.get("/send-notification", async (req, res) => {
  try {
    const payload = JSON.stringify({
      title: "Hello, World!",
      message: "This is a push notification.",
    });
    const subscriptions = await NotificationSubscription.findAll();
    subscriptions.forEach((subscription) => {
      sendNotification(subscription, payload);
    });
    res.status(200).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//the access-denied page
router.get("/access-denied", (req, res) => {
  res.status(403).render("access-denied");
});

export default router;
