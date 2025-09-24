import { randomBytes } from "crypto";
import readline from "readline";

console.log("1");
function validateInteger(input, min, max) {
  const parsedInput = parseInt(input);
  if (isNaN(parsedInput) || !Number.isInteger(parsedInput)) {
    return false;
  }
  if (min !== undefined && parsedInput < min) {
    return false;
  }
  if (max !== undefined && parsedInput > max) {
    return false;
  }
  return true;
}
console.log("2");
const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const secrets = {};
console.log("Ready");
const getSecrets = () => {
  return new Promise((resolve, reject) => {
    console.log("Go");
    read.question(
      "Enter the no of secret keys you require. must be <20 : ",
      (answer) => {
        var i = 5;
        if (validateInteger(answer, 1, 20)) {
          console.log("Input is a valid integer between 1 and 20. ");
          i = answer;
        } else {
          console.log(
            `Input is not a valid integer between 1 and 20. What do you want to use ${answer} keys for ? 5 is okay`
          );
        }
        while (i > 0) {
          const key = randomBytes(32).toString("base64");
          console.log(key);
          i--;
        }
        read.question(
          "Enter an array of all the secret keys (comma-seperated) remember 5th and 6th keys are for webNotification \n:  ",
          (answer) => {
            const secretKeys = answer.split(",").map((key) => key.trim());
            if (secretKeys.length !== 10) {
              console.log("key input is not right");
              process.exit(1);
            }

            const secrets = {
              SESSION_SECRET: secretKeys[0],
              DATABASE_ENCRYPTION_KEY: secretKeys[1],
              MAIL_AUTH_USER: secretKeys[2],
              MAIL_AUTH_PASS: secretKeys[3],
              WEB_NOTIFICATION_PUBLIC_KEY: secretKeys[4],
              WEB_NOTIFICATION_PRIVATE_KEY: secretKeys[5],
              AUTH_TOKEN: secretKeys[6],
              WORKER_AUTH_TOKEN: secretKeys[7],
              ADMIN_AUTH_TOKEN: secretKeys[8],
              PORT: secretKeys[9]
            };
            // secrets.DATABASE_ENCRYPTION_KEY = answer[9];
            // Add more questions for other secrets as needed
            read.close();
            resolve(secrets);
          }
        );
      }
    );
  });
};
const secrets = await getSecrets();
// console.log(sec);
console.log(secrets);
// if (secrets) {
//   const not = require("notification/webNotification.js")(secrets);
// }

export { getSecrets, secrets };
