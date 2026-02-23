const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, dbConfig);

// Import models
const User = require("./User")(sequelize);
const Entry = require("./Entry")(sequelize);
const Tag = require("./Tag")(sequelize);

// Associations
User.hasMany(Entry, { foreignKey: "userId", as: "entries", onDelete: "CASCADE" });
Entry.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Tag, { foreignKey: "userId", as: "tags", onDelete: "CASCADE" });
Tag.belongsTo(User, { foreignKey: "userId", as: "user" });

Entry.belongsToMany(Tag, { through: "entry_tags", as: "tags", foreignKey: "entryId" });
Tag.belongsToMany(Entry, { through: "entry_tags", as: "entries", foreignKey: "tagId" });

module.exports = { sequelize, Sequelize, User, Entry, Tag };
