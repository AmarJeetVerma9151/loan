const Insurance = require("../models/Insurance")
const BaseController = require("../core/BaseController")
const config = require("../config");
const User = require("../models/User");

const insuranceController = new BaseController(Insurance, {
  name: "Insurance",
  access: "customer",

  get: {
    pagination: config.pagination,
    populate: [{
      path: "agent",
      select: "name mobile"
    }]
  }

})

insuranceController.createInsurance = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // 🔥 FIXED: User model ab define hai
    const agents = await User.find({ role: "agent" });
    if (!agents.length) {
      return res.status(503).json({ message: "No agents available right now." });
    }

    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    const insuranceData = {
      ...req.body,
      user: req.user._id,
      agent: randomAgent._id,
      status: [
        {
          state: "pending",
          remarks: [{ note: "Insurance created" }]
        }
      ]
    };

    const newInsurance = await Insurance.create(insuranceData);
    const savedInsurance = await Insurance.findById(newInsurance._id)
      .populate("agent", "name email mobile")
      .populate("user", "name email mobile")
      .lean();

    return res.status(201).json({
      message: "Insurance application submitted successfully",
      Insurance: savedInsurance,
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Error submitting Insurance application",
      error: error.message,
    });
  }
};

const agentInsuranceController = new BaseController(Insurance, {
  name: "Insurance",
  access: "agent",

  get: {
    pagination: config.pagination,
    populate: [{
      path: 'user',
    },
    ],
    query: ['name'],
    pre: async (filter, req) => {
      if (!req.user || !req.user._id) throw new Error("User not found in request");

      filter.agent = req.user._id;
      return filter;
    }
  },


})



module.exports = {
  insuranceController,
  agentInsuranceController
}