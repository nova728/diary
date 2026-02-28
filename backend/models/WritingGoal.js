const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WritingGoal = sequelize.define(
    "WritingGoal",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "user_id",
      },
      // Daily word goal
      dailyWordGoal: {
        type: DataTypes.INTEGER,
        defaultValue: 300,
        field: "daily_word_goal",
      },
      // Weekly entry count goal
      weeklyEntryGoal: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        field: "weekly_entry_goal",
      },
      // Reminder settings
      reminderEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "reminder_enabled",
      },
      reminderTime: {
        type: DataTypes.STRING(5), // "21:00"
        defaultValue: "21:00",
        field: "reminder_time",
      },
      reminderEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "reminder_email",
      },
    },
    {
      tableName: "writing_goals",
      indexes: [
        { unique: true, fields: ["user_id"] },
      ],
    }
  );

  return WritingGoal;
};
