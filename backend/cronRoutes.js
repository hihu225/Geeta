const express = require('express');
const router = express.Router();
const User = require('./models/usermodels');
const Chat = require('./models/chat');
const Theme = require('./models/theme');
const auth = require('./middleware/auth');

// Simple admin guard: require ADMIN_API_KEY header
const requireAdmin = (req, res, next) => {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

router.delete('/cleanup', requireAdmin, async (req, res) => {
  try {
    const [chatUserIds, themeUserIds] = await Promise.all([
      Chat.distinct('userId'),
      Theme.distinct('userId'),
    ]);

    const allUserIds = [...new Set([...chatUserIds, ...themeUserIds].map(String))];

    const existingUsers = await User.find({ _id: { $in: allUserIds } }, '_id');
    const existingUserIds = new Set(existingUsers.map((u) => u._id.toString()));

    const orphanUserIds = allUserIds.filter((id) => !existingUserIds.has(id));

    if (orphanUserIds.length === 0) {
      return res.status(200).json({ success: true, message: 'No orphaned data found.' });
    }

    const [chatResult, themeResult] = await Promise.all([
      Chat.deleteMany({ userId: { $in: orphanUserIds } }),
      Theme.deleteMany({ userId: { $in: orphanUserIds } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Orphaned data cleaned up successfully.',
      deletedChats: chatResult.deletedCount,
      deletedThemes: themeResult.deletedCount,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up orphaned data',
      error: error.message,
    });
  }
});

module.exports = router;
