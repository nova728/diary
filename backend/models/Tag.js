const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tag = sequelize.define(
    "Tag",
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
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { len: [1, 50] },
      },
    },
    {
      tableName: "tags",
      indexes: [{ unique: true, fields: ["user_id", "name"] }],
    }
  );

  return Tag;
};
