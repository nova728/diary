const { Op, fn, col } = require("sequelize");
const { Achievement, Entry, Tag, WritingGoal, sequelize } = require("../models");

const ALL_ACHIEVEMENTS = Achievement.ACHIEVEMENTS;

// ── Check and unlock achievements ─────────────────────────────────────────────
async function checkAchievements(userId) {
  const unlocked = await Achievement.findAll({
    where: { userId },
    attributes: ["key"],
    raw: true,
  });
  const unlockedKeys = new Set(unlocked.map((a) => a.key));
  const newlyUnlocked = [];

  // Get user stats
  const [totalEntries, totalWords, uniqueMoods, tagCount, dates] = await Promise.all([
    Entry.count({ where: { userId } }),
    Entry.sum("wordCount", { where: { userId } }),
    Entry.count({ where: { userId, mood: { [Op.ne]: null } }, distinct: true, col: "mood" }),
    Tag.count({ where: { userId } }),
    Entry.findAll({
      where: { userId },
      attributes: ["date"],
      order: [["date", "DESC"]],
      raw: true,
    }),
  ]);

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateSet = new Set(dates.map((d) => d.date));
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dateSet.has(key)) streak++;
    else if (i > 0) break;
  }

  // Check each achievement
  for (const ach of ALL_ACHIEVEMENTS) {
    if (unlockedKeys.has(ach.key)) continue;

    let qualified = false;
    switch (ach.category) {
      case "streak":
        qualified = streak >= ach.threshold;
        break;
      case "entries":
        qualified = totalEntries >= ach.threshold;
        break;
      case "words":
        qualified = (totalWords || 0) >= ach.threshold;
        break;
      case "special":
        if (ach.key === "first_entry") qualified = totalEntries >= 1;
        if (ach.key === "mood_variety") qualified = uniqueMoods >= 8;
        if (ach.key === "tag_master") qualified = tagCount >= 10;
        break;
    }

    if (qualified) {
      await Achievement.create({ userId, key: ach.key });
      newlyUnlocked.push({ ...ach, unlockedAt: new Date() });
    }
  }

  return newlyUnlocked;
}

// ── List all achievements for a user ──────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const unlocked = await Achievement.findAll({
      where: { userId: req.user.id },
      raw: true,
    });
    const unlockedMap = {};
    unlocked.forEach((a) => {
      unlockedMap[a.key] = a.unlocked_at || a.unlockedAt;
    });

    const achievements = ALL_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: !!unlockedMap[ach.key],
      unlockedAt: unlockedMap[ach.key] || null,
    }));

    res.json({ achievements });
  } catch (err) {
    next(err);
  }
};

// ── Trigger achievement check (called after creating/updating entries) ────────
exports.check = async (req, res, next) => {
  try {
    const newlyUnlocked = await checkAchievements(req.user.id);
    res.json({ newlyUnlocked });
  } catch (err) {
    next(err);
  }
};

// ── Writing Goal CRUD ─────────────────────────────────────────────────────────
exports.getGoal = async (req, res, next) => {
  try {
    let goal = await WritingGoal.findOne({ where: { userId: req.user.id } });
    if (!goal) {
      goal = await WritingGoal.create({ userId: req.user.id });
    }
    res.json({ goal });
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { dailyWordGoal, weeklyEntryGoal, reminderEnabled, reminderTime, reminderEmail } = req.body;

    let goal = await WritingGoal.findOne({ where: { userId: req.user.id } });
    if (!goal) {
      goal = await WritingGoal.create({ userId: req.user.id });
    }

    const updates = {};
    if (dailyWordGoal !== undefined) updates.dailyWordGoal = dailyWordGoal;
    if (weeklyEntryGoal !== undefined) updates.weeklyEntryGoal = weeklyEntryGoal;
    if (reminderEnabled !== undefined) updates.reminderEnabled = reminderEnabled;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (reminderEmail !== undefined) updates.reminderEmail = reminderEmail;

    await goal.update(updates);
    res.json({ goal });
  } catch (err) {
    next(err);
  }
};

// ── Writing Goal Progress ─────────────────────────────────────────────────────
exports.getGoalProgress = async (req, res, next) => {
  try {
    let goal = await WritingGoal.findOne({ where: { userId: req.user.id } });
    if (!goal) {
      goal = await WritingGoal.create({ userId: req.user.id });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Today's word count
    const todayWords = (await Entry.sum("wordCount", {
      where: { userId: req.user.id, date: today },
    })) || 0;

    // This week's entry count (Mon–Sun)
    const now = new Date();
    const day = now.getDay() || 7; // Mon=1..Sun=7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const weekEntries = await Entry.count({
      where: {
        userId: req.user.id,
        date: { [Op.gte]: monday.toISOString().slice(0, 10) },
      },
    });

    res.json({
      goal,
      progress: {
        dailyWords: todayWords,
        dailyWordGoal: goal.dailyWordGoal,
        dailyPercent: Math.min(100, Math.round((todayWords / goal.dailyWordGoal) * 100)),
        weeklyEntries: weekEntries,
        weeklyEntryGoal: goal.weeklyEntryGoal,
        weeklyPercent: Math.min(100, Math.round((weekEntries / goal.weeklyEntryGoal) * 100)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Export for use in entry controller
exports.checkAchievements = checkAchievements;
