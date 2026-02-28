const { Op, fn, col, literal } = require("sequelize");
const { Entry, Tag, sequelize } = require("../models");

// ── "That year today" — entries from same day in previous years ───────────────
exports.onThisDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const thisYear = today.getFullYear();

    // Find entries with the same month-day but different year
    const entries = await Entry.findAll({
      where: {
        userId,
        [Op.and]: [
          sequelize.where(fn("TO_CHAR", col("date"), "MM-DD"), `${month}-${day}`),
          sequelize.where(fn("EXTRACT", literal("YEAR FROM date")), { [Op.lt]: thisYear }),
        ],
      },
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
      order: [["date", "DESC"]],
    });

    const grouped = entries.map((e) => ({
      ...e.toJSON(),
      yearsAgo: thisYear - new Date(e.date).getFullYear(),
    }));

    res.json({ entries: grouped, date: `${month}-${day}` });
  } catch (err) {
    next(err);
  }
};

// ── Random memory — one random historical entry ──────────────────────────────
exports.randomMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const entry = await Entry.findOne({
      where: { userId },
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
      order: sequelize.random(),
    });

    if (!entry) {
      return res.json({ entry: null });
    }

    res.json({ entry });
  } catch (err) {
    next(err);
  }
};

// ── Timeline — entries grouped by year/month ─────────────────────────────────
exports.timeline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, page = 1, limit = 50 } = req.query;

    const where = { userId };
    if (year) {
      where.date = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
    }

    const { rows: entries, count } = await Entry.findAndCountAll({
      where,
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
      order: [["date", "DESC"]],
      limit: Math.min(100, parseInt(limit)),
      offset: (Math.max(1, parseInt(page)) - 1) * parseInt(limit),
      distinct: true,
    });

    // Group by year-month
    const groups = {};
    entries.forEach((entry) => {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = { yearMonth: key, entries: [] };
      groups[key].entries.push(entry);
    });

    // Get all available years for the user
    const years = await Entry.findAll({
      where: { userId },
      attributes: [[fn("DISTINCT", fn("EXTRACT", literal("YEAR FROM date"))), "year"]],
      order: [[literal("year"), "DESC"]],
      raw: true,
    });

    res.json({
      timeline: Object.values(groups),
      years: years.map((y) => parseInt(y.year)),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Heatmap — daily activity for a full year ─────────────────────────────────
exports.heatmap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;

    const data = await Entry.findAll({
      where: {
        userId,
        date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
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

    // Build a map of date -> { count, words }
    const map = {};
    data.forEach((d) => {
      map[d.date] = { count: parseInt(d.count), words: parseInt(d.words) || 0 };
    });

    // Generate full year data (365/366 days)
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const heatmap = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      heatmap.push({
        date: key,
        count: map[key]?.count || 0,
        words: map[key]?.words || 0,
      });
    }

    // Total stats for the year
    const totalDays = data.length;
    const totalEntries = data.reduce((sum, d) => sum + parseInt(d.count), 0);
    const totalWords = data.reduce((sum, d) => sum + (parseInt(d.words) || 0), 0);

    res.json({
      heatmap,
      year: parseInt(year),
      stats: { totalDays, totalEntries, totalWords },
    });
  } catch (err) {
    next(err);
  }
};
