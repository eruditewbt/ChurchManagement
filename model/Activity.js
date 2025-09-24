import { DataTypes } from "sequelize";
import { sequelizeActivity } from "../database/db_setup.js";
import User from "./User.js";

// Define the Activity model
const Activity = sequelizeActivity.define("Activity", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  USERID: {
    type: DataTypes.UUID,
    // references: {
    //   model: User,
    //   key: "id",
    // },
  },
  ACTIVITYTYPE: {
    type: DataTypes.STRING,
  },
  DATE: {
    type: DataTypes.DATEONLY,
  },
  TIME: {
    type: DataTypes.TIME,
  },
  RESPONSE: {
    type: DataTypes.TEXT,
  },
  PERFORMER: {
    type: DataTypes.STRING,
  },
});

export default Activity;
