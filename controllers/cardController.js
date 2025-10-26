const creditCard = require("../models/card")
const BaseController = require("../core/BaseController")
const config = require("../config")

const creditCardController = new BaseController(creditCard, {
    name: 'card',
    access: "customer",

    get: {
        pagination: config.pagination,

        populate: [{
            path: "agent",
            select: "name  loanType"
        }],
        pre: async (filter, req) => {
            // Ensure logged-in user exists
            if (!req.user || !req.user._id) throw new Error("User not found in request");

            // Only fetch loans where the user is the logged-in user
            filter.user = req.user._id;

            return filter;
        }

    }

})

creditCardController.createCreditCard = async (req, res) => {
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
                    remarks: [{ note: "Credit-card application created" }]
                }
            ]
        };

        const newCredit = await Credit.create(loanData);
        const savedcreate = await Credit.findById(newCredit._id)
            .populate("agent", "name email mobile")
            .populate("user", "name email mobile")
            .lean();


        return res.status(201).json({
            message: "Credit application submitted successfully",
            Credit: savedcreate,
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: "Error submitting Credit application",
            error: error.message,
        });
    }
};

const agentbaseControllerCreditCard = new BaseController(creditCard, {
  name: "Credit",
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

module.exports ={ 
    creditCardController,
    agentbaseControllerCreditCard
}