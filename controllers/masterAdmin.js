const BaseController = require("../core/BaseController")
const Loan = require("../models/loan")
const config = require("../config")
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const adminController = new BaseController(Loan, {
    name: "loan",
    accessKey: "admin",
    get: {
        pagination: config.pagination,
        populate: [{
            path: "customer",
            select: "-otp -password"
        }]
    }
})

adminController.getTotalAgents = async (req, res) => {
    try {
        // 🔹 Admin ya authorized user ke liye (optional check)
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // const decoded = jwt.verify(token, process.env.JWT_SECRET || "yoursecret");
        const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);


        // 🔹 Date range from query params
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

        // 🔹 Find all users with role = 'agent' and date filter
        const agents = await User.find({
            role: "agent",
            ...dateFilter,
        }).select("name email mobile createdAt");

        // 🔹 Total count
        const totalAgents = agents.length;

        // 🔹 Response
        res.status(200).json({
            success: true,
            message: "Agents fetched successfully",
            totalAgents,
            data: agents,
            filterUsed: { startDate, endDate },
        });

    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching agents",
            error: error.message,
        });
    }
};
adminController.getApprovedLoans = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Filter object
        let filter = { "status.state": "accepted" };

        // Agar date range diya gaya hai to date filter add karo
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // ✅ Total approved loans (across all agents)
        const totalApprovedLoans = await Loan.countDocuments(filter);

        // ✅ Agar admin dashboard par loan list bhi dikhani ho:
        const approvedLoans = await Loan.find(filter)
            .populate({
                path: "user",
                select: "name email mobile",
            })
            .populate({
                path: "agent",
                select: "name email mobile",
            })
            .sort({ createdAt: -1 }); // latest first

        res.status(200).json({
            success: true,
            totalApprovedLoans,
            approvedLoans,
            message: "Approved loans fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching approved loans:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

adminController.getPendingLoansForAdmin = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Filter object
        let filter = { "status.state": "pending" };

        // Agar date range diya gaya hai to date filter add karo
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // ✅ Total approved loans (across all agents)
        const totalPendingLoans = await Loan.countDocuments(filter);

        // ✅ Agar admin dashboard par loan list bhi dikhani ho:
        const pendingLoans = await Loan.find(filter)
            .populate({
                path: "user",
                select: "name email mobile",
            })
            .populate({
                path: "agent",
                select: "name email mobile",
            })
            .sort({ createdAt: -1 }); // latest first

        res.status(200).json({
            success: true,
            totalPendingLoans,
            pendingLoans,
            message: "Pending loans fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching Pending loans:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

adminController.getApprovedLoansPercentage = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // 🕒 Filter by date if provided
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // ✅ Count total loans
        const totalLoans = await Loan.countDocuments(dateFilter);

        // ✅ Count approved loans (where latest status.state == "accepted")
        const approvedLoans = await Loan.countDocuments({
            ...dateFilter,
            "status.state": "accepted"
        });

        // ✅ Calculate percentage
        const approvedPercentage =
            totalLoans > 0 ? ((approvedLoans / totalLoans) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Approved loans fetched successfully",
            totalLoans,
            approvedLoans,
            approvedPercentage: `${approvedPercentage}%`,
        });
    } catch (error) {
        console.error("Error fetching approved loan stats:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching approved loan stats",
            error: error.message,
        });
    }
};

adminController.blockAgent = async (req, res) => {
    try {
        const agentId = req.params.id;
        const { block } = req.body; // frontend से true या false आएगा

        // पहले check करें कि user exist करता है या नहीं
        const agent = await User.findById(agentId);
        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        // केवल agent को ही block किया जा सके
        if (agent.role !== "agent") {
            return res.status(400).json({ message: "Only agents can be blocked" });
        }

        // isBlocked field update करें
        agent.isBlocked = block;
        await agent.save();

        res.status(200).json({
            success: true,
            message: `Agent has been ${block ? 'blocked' : 'unblocked'} successfully`,
            agent,
        });
    } catch (error) {
        console.error("Error blocking agent:", error);
        res.status(500).json({
            success: false,
            message: "Server error while blocking agent",
            error: error.message,
        });
    }
};






module.exports = adminController