// db_setup.js
// Only initializes and exports the Sequelize instance and syncDatabase utility.
import { Sequelize } from "sequelize";
// import sqlcipher from "sqlcipher"
import { secrets } from "../getSecret.js";
// const key = secrets.DATABASE_ENCRYPTION_KEY;
// Set up the SQLite database connection
const sequelizeActivity = new Sequelize({
  dialect: "sqlite",
  storage: "./activity.sqlite", // This is where the database file will be created
  dialectOptions: {
    // nativeBinding: sqlcipher,
    cipher: "aes-256-cbc",
    key: secrets.DATABASE_ENCRYPTION_KEY,
  },
});

const sequelizeNotification = new Sequelize({
  dialect: "sqlite",
  storage: "./notification.sqlite", // This is where the database file will be created
  dialectOptions: {
    // nativeBinding: sqlcipher,
    cipher: "aes-256-cbc",
    key: secrets.DATABASE_ENCRYPTION_KEY,
  },
});

const sequelizeUser = new Sequelize({
  dialect: "sqlite",
  storage: "./user.sqlite", // This is where the database file will be created
  dialectOptions: {
    // nativeBinding: sqlcipher,
    cipher: "aes-256-cbc",
    key: secrets.DATABASE_ENCRYPTION_KEY,
  },
});

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./useragent.sqlite", // This is where the database file will be created
  dialectOptions: {
    // nativeBinding: sqlcipher,
    cipher: "aes-256-cbc",
    key: secrets.DATABASE_ENCRYPTION_KEY,
  },
});

function cipherDetails() {
  sequelize
    .query("PRAGMA cipher_version;", { type: Sequelize.QueryTypes.SELECT })
    .then((results) => {
      console.log(results);
    })
    .catch((err) => {
      console.error(err);
    });

  sequelize
    .query("PRAGMA cipher_settings;", { type: Sequelize.QueryTypes.SELECT })
    .then((results) => {
      console.log(results);
    })
    .catch((err) => {
      console.error(err);
    });
}


// Utility to sync all models (should be called after all models and associations are loaded)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    await sequelizeUser.sync({ alter: true });
    await sequelizeNotification.sync({ alter: true });
    await sequelizeActivity.sync({ alter: true });
    console.log("Database and tables created or updated successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// sync database user agent
const syncDatabaseUserAgent = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database and tables created or updated successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// sync database user
const syncDatabaseUser = async () => {
  try {
    await sequelizeUser.sync({ alter: true });
    console.log("Database and tables created or updated successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// sync database notification
const syncDatabaseNotification = async () => {
  try {
    await sequelizeNotification.sync({ alter: true });
    console.log("Database and tables created or updated successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// sync database activity
const syncDatabaseActivity = async () => {
  try {
    await sequelizeActivity.sync({ alter: true });
    console.log("Database and tables created or updated successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export {
  sequelize,
  sequelizeActivity,
  sequelizeNotification,
  sequelizeUser,
  syncDatabase,
  syncDatabaseUserAgent,
  syncDatabaseUser,
  syncDatabaseNotification,
  syncDatabaseActivity,
  cipherDetails,
};
