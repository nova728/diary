const { Op, fn, col, literal } = require("sequelize");
const { Entry, Tag, sequelize } = require("../models");

exports.overview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalEntries, totalWords, dates] = await Promise.all([
      Entry.count({ where: { userId } }),
      Entry.sum("wordCount", { where: { userId } }),
      Entry.findAll({
        where: { userId },
        attributes: ["date"],
        order: [["date", "DESC"]],
        raw: true,
      }),
    ]);

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateSet = new Set(dates.map((d) => d.date));

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (dateSet.has(key)) streak++;
      else if (i > 0) break;
    }

    // This month count
    const now = new Date();
    const thisMonth = await Entry.count({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        },
      },
    });

    res.json({
      totalEntries,
      totalWords: totalWords || 0,
      streak,
      thisMonth,
    });
  } catch (err) {
    next(err);
  }
};

exports.moods = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.user.id, mood: { [Op.ne]: null } };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const data = await Entry.findAll({
      where,
      attributes: ["mood", [fn("COUNT", col("id")), "count"]],
      group: ["mood"],
      raw: true,
    });

    res.json({ moods: data });
  } catch (err) {
    next(err);
  }
};

exports.activity = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const data = await Entry.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      attributes: [
        "date",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("word_count")), "words"],
      ],
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    res.json({ activity: data });
  } catch (err) {
    next(err);
  }
};

exports.tags = async (req, res, next) => {
  try {
    const data = await sequelize.query(
      `SELECT t.name, COUNT(et.entry_id) as count
       FROM tags t
       JOIN entry_tags et ON t.id = et.tag_id
       JOIN entries e ON et.entry_id = e.id
       WHERE e.user_id = :userId
       GROUP BY t.id, t.name
       ORDER BY count DESC
       LIMIT 20`,
      { replacements: { userId: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({ tags: data });
  } catch (err) {
    next(err);
  }
};
