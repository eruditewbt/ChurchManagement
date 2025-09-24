// to define the User Agent model:
import { DataTypes } from "sequelize";
import { sequelize } from "../database/db_setup.js";
import User from "./User.js";

const UserAgent = sequelize.define("UserAgent", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  // userId: {
  //   type: DataTypes.UUID,
  //   references: {
  //     model: User,
  //     key: "id",
  //   },
  // },
  USERID: {
    type: DataTypes.UUID,
  },
  IPADDRESS: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  USERAGENT: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  LASTACTIVITY: {
    type: DataTypes.DATE,
    // allowNull: false,
  },
  ISACTIVE: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  FAILEDCOUNT: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  LOCATION: {
    type: DataTypes.JSON,
    // allowNull: true,
  },
  ROLE: {
    type: DataTypes.STRING,
    // allowNull: true,
  },
});

export default UserAgent;
