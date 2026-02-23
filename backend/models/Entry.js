const { DataTypes } = require("sequelize");

const MOODS = ["happy", "calm", "sad", "angry", "anxious", "excited", "grateful", "tired"];

module.exports = (sequelize) => {
  const Entry = sequelize.define(
    "Entry",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      title: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: { len: [1, 300] },
      },
      // Rich text stored as JSON (TipTap format)
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // Plain text extracted from content, used for full-text search
      contentText: {
        type: DataTypes.TEXT,
        field: "content_text",
      },
      mood: {
        type: DataTypes.ENUM(...MOODS),
        allowNull: true,
      },
      wordCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "word_count",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_pinned",
      },
    },
    {
      tableName: "entries",
      indexes: [
        { fields: ["user_id", "date"] },
        { fields: ["user_id", "mood"] },
      ],
    }
  );

  return Entry;
};
