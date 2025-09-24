// database/db_queries.js
import { User } from "./associations.js";
// 2. CRUD Operations and Queries
// Here are code examples for performing CRUD operations and the specific queries you requested. These operations should be written in separate files or within your route handlers.
// User Operations

// Create a new user record
const createUser = async (userData) => {
  try {
    const newUser = await User.create(userData);
    console.log("User created:", newUser.toJSON());
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

// Search for any data:
// Search for a user by name, email, or phone number
const searchUsers = async (searchTerm) => {
  try {
    const users = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          { NAME: { [Sequelize.Op.like]: `%${searchTerm}%` } },
          { EMAIL: { [Sequelize.Op.like]: `%${searchTerm}%` } },
          { PHONENUMBER: { [Sequelize.Op.like]: `%${searchTerm}%` } },
        ],
      },
    });
    console.log(
      "Search results:",
      users.map((user) => user.toJSON())
    );
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
  }
};

// Fetch all on a particular date:
// Find all users created on a specific date
const findUsersByDate = async (targetDate) => {
  try {
    const users = await User.findAll({
      where: {
        DATE: targetDate,
      },
    });
    console.log(
      "Users on date:",
      users.map((user) => user.toJSON())
    );
    return users;
  } catch (error) {
    console.error("Error fetching users by date:", error);
  }
};

// Fetch those with same date and sort by follow up:
// Find users created on a specific date, ordered by their follow-up status
const findUsersByDateAndSortByFollowUp = async (targetDate) => {
  try {
    const users = await User.findAll({
      where: {
        DATE: targetDate,
      },
      order: [
        [FOLLOWUP, "ASC"], // Sorts by follow up in ascending order
      ],
    });
    console.log(
      "Users sorted by follow up:",
      users.map((user) => user.toJSON())
    );
    return users;
  } catch (error) {
    console.error("Error fetching and sorting users:", error);
  }
};

// Fetch those with same month and sort by follow up:
// Find users created within the current month, ordered by their follow-up status
const findUsersByMonthAndSortByFollowUp = async () => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const today = new Date();

    const users = await User.findAll({
      where: {
        DATE: {
          [Op.between]: [startOfMonth, today],
        },
      },
      order: [
        ["FOLLOW UP", "ASC"], // Sorts by follow up in ascending order
      ],
    });
    console.log(
      "Users sorted by follow up:",
      users.map((user) => user.toJSON())
    );
    return users;
  } catch (error) {
    console.error("Error fetching and sorting users:", error);
  }
};

// Fetch those with same unit:
// Find all users belonging to a specific unit
const findUsersByUnit = async (unitName) => {
  try {
    const users = await User.findAll({
      where: {
        UNIT: unitName,
      },
    });
    console.log(
      "Users in unit:",
      users.map((user) => user.toJSON())
    );
    return users;
  } catch (error) {
    console.error("Error fetching users by unit:", error);
  }
};

// Activity Operations
// Fetch all with same userid sort by date then time:
// Find all activities for a specific user, ordered by date and time
const findActivitiesByUser = async (userId) => {
  try {
    const activities = await Activity.findAll({
      where: {
        USERID: userId,
      },
      order: [
        ["DATE", "ASC"], // Sort by date first
        ["TIME", "ASC"], // Then by time
      ],
    });
    console.log(
      "Activities for user:",
      activities.map((activity) => activity.toJSON())
    );
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

export {
  createUser,
  searchUsers,
  findUsersByDate,
  findUsersByDateAndSortByFollowUp,
  findUsersByMonthAndSortByFollowUp,
  findUsersByUnit,
  findActivitiesByUser,
};
