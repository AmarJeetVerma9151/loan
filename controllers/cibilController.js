const cibil = require("../models/cibil")
const BaseController = require("../core/BaseController")
const config = require("../config")

const cibilController = new BaseController(cibil, {
    name: 'cibil',
    access: "customer",

    create: {
        pre: async (data, req, res) => {
            // Ensure user is logged in
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            const existingCibil = await cibil.findOne({ user: req.user._id });
            if (existingCibil) {
                return res.status(400).json({
                    message: "Cibil already exists."
                });
            }
            // Automatically add logged-in user's ID
            data.user = req.user._id;

            return data;
        },

        get: {
    pre: async (filter, req) => {
      if (!req.user || !req.user._id) throw new Error("User not found in request");

      filter.user = req.user._id;

      return filter;
    }
        }
    }
})

module.exports = cibilController