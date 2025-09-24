import { DataTypes } from "sequelize";
import { sequelizeUser } from "../database/db_setup.js";

// Define the User model
const User = sequelizeUser.define("User", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  DATE: {
    type: DataTypes.DATEONLY, // DATEONLY is a good choice for dates without time
    allowNull: false,
  },
  NAME: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  SEX: {
    type: DataTypes.STRING,
  },
  ADDRESS: {
    type: DataTypes.STRING,
  },
  FOLLOWUP: {
    // Use a string for column names with spaces
    type: DataTypes.STRING,
  },
  CAT: {
    type: DataTypes.STRING,
  },
  PHONENUMBER: {
    type: DataTypes.STRING,
  },
  PRAYER: {
    type: DataTypes.TEXT,
  },
  EMAIL: {
    type: DataTypes.STRING,
  },
  CREATOR: {
    type: DataTypes.STRING,
  },
  UNIT: {
    type: DataTypes.STRING,
  },
  ACTIVITYCOUNT: {
    type: DataTypes.INTEGER,
  },
  ATTENDANCECOUNT: {
    type: DataTypes.INTEGER,
  },
  LASTATTENDANCEDATE: {
    type: DataTypes.DATE,
  },
});

export default User;
