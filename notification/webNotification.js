// /. Web notifications _________

// implement web push notifications using the `web-push` library in Node.js:

// *Step 1: Generate VAPID Keys*

// Generate VAPID keys using the `web-push` library:
import webpush from "web-push";
import { secrets } from "../getSecret.js";

// const publicKey = await secrets.WEB_NOTIFICATION_PRIVATE_KEY;
// const privateKey = await secrets.WEB_NOTIFICATION_PUBLIC_KEY;
// const email = await secrets.MAIL_AUTH_USER;

function generateWebPushKey() {
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log(vapidKeys);
}
// generateWebPushKey();
// This will output the public and private VAPID keys.

// if (secrets.WEB_NOTIFICATION_PRIVATE_KEY) {
//   // *Step 2: Set Up Web Push*
//   webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
// }
// *Step 2: Set Up Web Push*
webpush.setVapidDetails(
  `mailto:${secrets.MAIL_AUTH_USER}`,
  secrets.WEB_NOTIFICATION_PUBLIC_KEY,
  secrets.WEB_NOTIFICATION_PRIVATE_KEY
);
// *Step 4: Send Push Notifications*

// Create a function to send push notifications:
const sendNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Notification sent successfully!");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// *Client-Side Code*

// On the client-side, you'll need to register a service worker and subscribe to push notifications:
// navigator.serviceWorker
//   .register("sw.js")
//   .then((registration) => {
//     return registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: urlBase64ToUint8Array("YOUR_PUBLIC_VAPID_KEY"),
//     });
//   })
//   .then((subscription) => {
//     // Send the subscription object to your server
//     fetch("/subscribe", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(subscription),
//     });
//   })
//   .catch((error) => {
//     console.error("Error subscribing to push notifications:", error);
//   });

export { generateWebPushKey, sendNotification };
