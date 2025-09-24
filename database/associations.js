// associations.js
// Define all model associations here to avoid circular dependencies

import User from "../model/User.js";
import Activity from "../model/Activity.js";
import NotificationSubscription from "../model/NotificationSubscription.js";
import UserAgent from "../model/UserAgent.js";

// User-Activity
// User.hasMany(Activity, { foreignKey: "USERID" });
// Activity.belongsTo(User, { foreignKey: "USERID" });

// // User-NotificationSubscription
// User.hasMany(NotificationSubscription, { foreignKey: "userId" });
// NotificationSubscription.belongsTo(User, { foreignKey: "userId" });

// // User-UserAgent
// User.hasMany(UserAgent, { foreignKey: "userId" });
// UserAgent.belongsTo(User, { foreignKey: "userId" });

export { User, Activity, NotificationSubscription, UserAgent };
