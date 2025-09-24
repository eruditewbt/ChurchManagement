// to define the Notification Subscription model:

import { DataTypes } from "sequelize";
import { sequelizeNotification } from "../database/db_setup.js";
import User from "./User.js";

const NotificationSubscription = sequelizeNotification.define(
  "NotificationSubscription",
  {
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
    ip: {
      type: DataTypes.STRING,
    },
    EMAIL: {
      type: DataTypes.STRING,
    },
    ENDPOINT: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    KEYS: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    EXPIRATIONTIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ISACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }
);

export default NotificationSubscription;
