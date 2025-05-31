const express= require("express");
const admin = require("../utils/firebaseAdmin");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/send", auth, async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const message = {
    notification: { title, body },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
