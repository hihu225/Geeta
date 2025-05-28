const express = require('express');
const router = express.Router();
const User = require('./models/usermodels');
const Chat = require('./index');
const Theme = require('./index');
const mongoose = require('mongoose');

router.delete('/cleanup', async (req, res) => {
  try {
    // Get all unique userIds in Chat and Theme collections
    const [chatUserIds, themeUserIds] = await Promise.all([
      Chat.distinct('userId'),
      Theme.distinct('userId')
    ]);

    const allUserIds = [...new Set([...chatUserIds, ...themeUserIds])];

    // Find existing userIds
    const existingUsers = await User.find({ _id: { $in: allUserIds } }, '_id');
    const existingUserIds = existingUsers.map(user => user._id.toString());

    // Find orphaned userIds (not in User collection)
    const orphanUserIds = allUserIds.filter(id => !existingUserIds.includes(id.toString()));

    if (orphanUserIds.length === 0) {
      return res.status(200).json({ success: true, message: 'No orphaned data found.' });
    }

    // Delete orphaned chats and themes
    const [chatResult, themeResult] = await Promise.all([
      Chat.deleteMany({ userId: { $in: orphanUserIds } }),
      Theme.deleteMany({ userId: { $in: orphanUserIds } })
    ]);

    res.status(200).json({
      success: true,
      message: 'Orphaned data cleaned up successfully.',
      deletedChats: chatResult.deletedCount,
      deletedThemes: themeResult.deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up orphaned data',
      error: error.message
    });
  }
});

module.exports = router;