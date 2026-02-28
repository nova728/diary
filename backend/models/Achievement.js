const { DataTypes } = require("sequelize");

// All possible achievements
const ACHIEVEMENTS = [
  // Streak achievements
  { key: "streak_7",   name: "初露锋芒",    description: "连续写作 7 天",   icon: "🔥", category: "streak",   threshold: 7 },
  { key: "streak_30",  name: "持之以恒",    description: "连续写作 30 天",  icon: "💪", category: "streak",   threshold: 30 },
  { key: "streak_100", name: "百日不辍",    description: "连续写作 100 天", icon: "🏆", category: "streak",   threshold: 100 },
  { key: "streak_365", name: "全年无休",    description: "连续写作 365 天", icon: "👑", category: "streak",   threshold: 365 },
  // Entry count achievements
  { key: "entries_10",   name: "崭露头角",  description: "累计写作 10 篇",    icon: "📝", category: "entries",  threshold: 10 },
  { key: "entries_50",   name: "笔耕不辍",  description: "累计写作 50 篇",    icon: "📖", category: "entries",  threshold: 50 },
  { key: "entries_100",  name: "百篇达成",  description: "累计写作 100 篇",   icon: "📚", category: "entries",  threshold: 100 },
  { key: "entries_365",  name: "日记大师",  description: "累计写作 365 篇",   icon: "🎓", category: "entries",  threshold: 365 },
  // Word count achievements
  { key: "words_10000",   name: "万字书生",  description: "总字数突破 1 万",   icon: "✍️", category: "words", threshold: 10000 },
  { key: "words_50000",   name: "五万雄文",  description: "总字数突破 5 万",   icon: "📜", category: "words", threshold: 50000 },
  { key: "words_100000",  name: "十万长篇",  description: "总字数突破 10 万",  icon: "🏅", category: "words", threshold: 100000 },
  // Special achievements
  { key: "first_entry",   name: "第一步",    description: "写下第一篇日记",     icon: "🌱", category: "special", threshold: 1 },
  { key: "mood_variety",  name: "多愁善感",  description: "使用过所有心情标记",   icon: "🎭", category: "special", threshold: 8 },
  { key: "tag_master",    name: "标签达人",  description: "创建 10 个不同标签",  icon: "🏷️", category: "special", threshold: 10 },
];

module.exports = (sequelize) => {
  const Achievement = sequelize.define(
    "Achievement",
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
      key: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      unlockedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "unlocked_at",
      },
    },
    {
      tableName: "achievements",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["user_id", "key"] },
      ],
    }
  );

  Achievement.ACHIEVEMENTS = ACHIEVEMENTS;

  return Achievement;
};
