const BaseController = require('../core/BaseController');
const Loan = require('../models/loan')
const config = require('../config');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');


const baseController = new BaseController(Loan, {
  name: "Loan ",
  access: "customer",

  get: {
    pagination: config.pagination,
    populate: [{
      path: 'agent',
      select: 'name mobile'
    },
    ],
    pre: async (filter, req) => {
      // logged-in user exists
      if (!req.user || !req.user._id) throw new Error("User not found in request");

      // Only fetch loans where the user is the logged-in user
      filter.user = req.user._id;

      return filter;
    }

  }
})

baseController.createLoan = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const agents = await User.find({ role: "agent" });
    if (!agents.length) {
      return res.status(503).json({ message: "No agents available right now." });
    }


    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    const loanData = {
      ...req.body,
      user: req.user._id,
      agent: randomAgent._id,
      status: [
        {
          state: "pending",
          remarks: [{ note: "Loan created" }]
        }
      ]
    };

    const newLoan = await Loan.create(loanData);
    const savedLoan = await Loan.findById(newLoan._id)
      .populate("agent", "name email mobile")
      .populate("user", "name email mobile")
      .lean();


    return res.status(201).json({
      message: "Loan application submitted successfully",
      loan: savedLoan,
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Error submitting loan application",
      error: error.message,
    });
  }
}

const agentbaseController = new BaseController(Loan, {
  name: "loan",
  access: "agent",

  get: {
    pagination: config.pagination
  },
  populate: [{
    path: "user",
    select: "name loanType"

  }],
  pre: async (filter, req) => {
    if (!req.user || !req.user._id) throw new Error("User not found in request");

    filter.agent = req.user._id;
    return filter;
  }
})

agentbaseController.getPendingLoansCount = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);
    console.log("Decoded token:", decoded);

    const agentId = decoded.id || decoded._id || decoded.userId;
    console.log("Agent ID:", agentId);

    const result = await Loan.aggregate([
      { $match: { agent: new mongoose.Types.ObjectId(agentId) } },
      { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } },
      { $match: { "status.state": "pending" } },
      { $count: "pendingCount" }
    ]);

    const count = result.length > 0 ? result[0].pendingCount : 0;

    res.status(200).json({
      success: true,
      message: "Pending loans fetched successfully",
      pendingCount: count,
    });
  } catch (error) {
    console.error("Error fetching pending loans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


agentbaseController.getMissingDocumentsCount = async (req, res) => {
  try {
    // 1️⃣ Token verify karna
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);
    const agentId = decoded.id || decoded._id || decoded.userId;

    // 2️⃣ Query params se startDate aur endDate lena
    const { startDate, endDate } = req.query;

    // agar user ne date nahi di to default pure data show hoga
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate) } };
    } else if (endDate) {
      dateFilter = { createdAt: { $lte: new Date(endDate) } };
    }

    // 3️⃣ MongoDB aggregation query
    const result = await Loan.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(agentId),
          ...dateFilter,
        },
      },
      { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } },
      { $match: { "status.state": "Missing Document" } },
      { $count: "missingCount" },
    ]);

    // 4️⃣ Count extract karna
    const count = result.length > 0 ? result[0].missingCount : 0;

    // 5️⃣ Response send karna
    res.status(200).json({
      success: true,
      message: "Missing Document loans fetched successfully",
      missingCount: count,
      filterUsed: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error fetching Missing Document loans:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

agentbaseController.getAcceptedLoansCount = async (req, res) => {
  try {
    // 1️⃣ Token se agent ki ID nikalna
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);
    const agentId = decoded.id || decoded._id || decoded.userId;

    // 2️⃣ startDate aur endDate query params se lena
    const { startDate, endDate } = req.query;

    // Agar user ne date di ho to filter bana lo
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate) } };
    } else if (endDate) {
      dateFilter = { createdAt: { $lte: new Date(endDate) } };
    }
    // 3️⃣ MongoDB aggregation query
    const result = await Loan.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(agentId),
          ...dateFilter, // apply date filter
        },
      },
      { $unwind: "$status" },
      { $match: { "status.state": "accepted" } },
      { $count: "acceptedCount" },
    ]);

    // 4️⃣ Count
    const count = result.length > 0 ? result[0].acceptedCount : 0;

    res.status(200).json({
      success: true,
      message: "Accepted loans fetched successfully",
      acceptedCount: count,
      filterUsed: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error fetching accepted loans:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

agentbaseController.getAcceptedLoansPercentage = async (req, res) => {
  try {
    // 1️⃣ Token verify karna
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);
    const agentId = decoded.id || decoded._id || decoded.userId;

    // 2️⃣ startDate aur endDate query params se lena
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate) } };
    } else if (endDate) {
      dateFilter = { createdAt: { $lte: new Date(endDate) } };
    }

    // 3️⃣ Total loans count
    const totalResult = await Loan.countDocuments({
      agent: new mongoose.Types.ObjectId(agentId),
      ...dateFilter,
    });

    // 4️⃣ Accepted loans count
    const acceptedResult = await Loan.aggregate([
      { $match: { agent: new mongoose.Types.ObjectId(agentId), ...dateFilter } },
      { $unwind: "$status" },
      { $match: { "status.state": "accepted" } },
      { $count: "acceptedCount" },
    ]);

    const acceptedCount = acceptedResult.length > 0 ? acceptedResult[0].acceptedCount : 0;

    // 5️⃣ Percentage calculate karna
    const acceptedPercentage = totalResult > 0 ? ((acceptedCount / totalResult) * 100).toFixed(2) : 0;

    // 6️⃣ Response
    res.status(200).json({
      success: true,
      message: "Accepted loans percentage fetched successfully",
      totalLoans: totalResult,
      acceptedLoans: acceptedCount,
      acceptedPercentage: acceptedPercentage + "%",
      filterUsed: { startDate, endDate },
    });

  } catch (error) {
    console.error("Error fetching accepted loans percentage:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { baseController, agentbaseController }