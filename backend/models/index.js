const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, dbConfig);

// Import models
const User = require("./User")(sequelize);
const Entry = require("./Entry")(sequelize);
const Tag = require("./Tag")(sequelize);
const Achievement = require("./Achievement")(sequelize);
const WritingGoal = require("./WritingGoal")(sequelize);

// Associations
User.hasMany(Entry, { foreignKey: "userId", as: "entries", onDelete: "CASCADE" });
Entry.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Tag, { foreignKey: "userId", as: "tags", onDelete: "CASCADE" });
Tag.belongsTo(User, { foreignKey: "userId", as: "user" });

Entry.belongsToMany(Tag, { through: "entry_tags", as: "tags", foreignKey: "entryId" });
Tag.belongsToMany(Entry, { through: "entry_tags", as: "entries", foreignKey: "tagId" });

User.hasMany(Achievement, { foreignKey: "userId", as: "achievements", onDelete: "CASCADE" });
Achievement.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(WritingGoal, { foreignKey: "userId", as: "writingGoal", onDelete: "CASCADE" });
WritingGoal.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, Sequelize, User, Entry, Tag, Achievement, WritingGoal };
