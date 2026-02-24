const { Op } = require("sequelize");
const { Entry, Tag, sequelize } = require("../models");
const { paginate } = require("../utils/pagination");

// Strip HTML tags to get plain text
const stripHtml = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Get or create tags by name for a user
const resolveTags = async (userId, tagNames, transaction) => {
  const tags = await Promise.all(
    tagNames.map((name) =>
      Tag.findOrCreate({ where: { userId, name: name.trim() }, transaction })
    )
  );
  return tags.map(([tag]) => tag);
};

exports.list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      mood,
      tag,
      startDate,
      endDate,
      sortBy = "date",
      order = "desc",
      pinned,
    } = req.query;

    const where = { userId: req.user.id };

    if (mood) where.mood = mood;
    if (pinned !== undefined) where.isPinned = pinned === "true";

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { contentText: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const include = [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }];

    if (tag) {
      include[0].where = { name: tag };
    }

    const validSortFields = { date: "date", createdAt: "created_at", wordCount: "word_count" };
    const orderField = validSortFields[sortBy] || "date";

    const { rows: entries, count } = await Entry.findAndCountAll({
      where,
      include,
      order: [
        ["is_pinned", "DESC"],
        [orderField, order.toUpperCase()],
      ],
      ...paginate(page, limit),
      distinct: true,
    });

    res.json({
      entries,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const entry = await Entry.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
    });

    if (!entry) return res.status(404).json({ error: "Entry not found" });

    res.json({ entry });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, content, mood, date, tags: tagNames = [], isPinned } = req.body;

    const contentText = stripHtml(content);
    const wordCount = contentText.replace(/\s+/g, "").length;

    const entry = await Entry.create(
      { userId: req.user.id, title, content, contentText, mood, wordCount, date, isPinned },
      { transaction: t }
    );

    if (tagNames.length > 0) {
      const tags = await resolveTags(req.user.id, tagNames, t);
      await entry.setTags(tags, { transaction: t });
    }

    await t.commit();

    const result = await Entry.findByPk(entry.id, {
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
    });

    res.status(201).json({ entry: result });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const entry = await Entry.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!entry) {
      await t.rollback();
      return res.status(404).json({ error: "Entry not found" });
    }

    const { title, content, mood, date, tags: tagNames, isPinned } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      updates.contentText = stripHtml(content);
      updates.wordCount = updates.contentText.replace(/\s+/g, "").length;
    }
    if (mood !== undefined) updates.mood = mood;
    if (date !== undefined) updates.date = date;
    if (isPinned !== undefined) updates.isPinned = isPinned;

    await entry.update(updates, { transaction: t });

    if (tagNames !== undefined) {
      const tags = tagNames.length > 0 ? await resolveTags(req.user.id, tagNames, t) : [];
      await entry.setTags(tags, { transaction: t });
    }

    await t.commit();

    const result = await Entry.findByPk(entry.id, {
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
    });

    res.json({ entry: result });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const entry = await Entry.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!entry) return res.status(404).json({ error: "Entry not found" });

    await entry.destroy();
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.togglePin = async (req, res, next) => {
  try {
    const entry = await Entry.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    await entry.update({ isPinned: !entry.isPinned });
    const result = await Entry.findByPk(entry.id, {
      include: [{ model: Tag, as: "tags", attributes: ["id", "name"], through: { attributes: [] } }],
    });

    res.json({ entry: result });
  } catch (err) {
    next(err);
  }
};
