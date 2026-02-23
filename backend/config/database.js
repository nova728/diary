require("dotenv").config();

const shared = {
  url: process.env.DATABASE_URL,
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Supabase 需要此选项
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: shared,
  production: shared,
};
