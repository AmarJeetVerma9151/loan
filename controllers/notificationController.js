const Notification = require("../models/notification");
const User = require("../models/User")

// 📩 Create and Send Notification
const createNotification = async (req, res) => {
  try {
    const { agentName, message, attachment } = req.body;

    // 1️⃣ Validation
    if (!agentName || !message || !attachment) {
      return res.status(400).json({ message: "Agent ID and message are required" });
    }

    // 2️⃣ Agent exist karta hai ya nahi
    const agent = await User.findById(agentName);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // 3️⃣ Notification create karo
    const newNotification = new Notification({
      agentName: agentName,
      attachement: attachment || "",
      message,
    });

    await newNotification.save();

    // 4️⃣ Response send karo
    res.status(201).json({
      success: true,
      message: "Notification sent successfully!",
      data: newNotification,
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification",
      error: error.message,
    });
  }
};
const getAllNotificationsWithAgent = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .select('message agentName createdAt') // select fields you need
      .populate('agentName', 'name email mobile') // get agent info
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports={createNotification,getAllNotificationsWithAgent}

