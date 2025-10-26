const mongoose = require("mongoose")


const InsuranceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"

    },
    type: {
        type: String,
        enm: ["Bike Insurance", "Car Insurance", "Health Insurance"],
        required: true
    },
    name: {
        type: String,
        required: true

    },
    mobile: {
        type: Number,
        require: true,
        unique:true

    },
    address: {
        address: {
            type: String,
            require: true
        },
        locality: {
            type: String,
            require: true

        },
        city: {
            type: String,
            required: true

        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        }
    },
    insuranceRenewal: {
        insuranceNo: {
            type: String,
            required: true,
        },
        expiryDate: {
            type: String,
            require: true
        },
        oldimg: {
            type: String,
            required: true
        }
    },
    status: {
        state: {
            type: String,
            enum: ["processing", "missing document", "approved", "rejected"],
            default: "processing"

        },

        updatedAt: {
            type: Date,
            default: Date.now
        }
    },

    agent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    createAt:{
        type:Date,
        default:Date.now
    }


})

module.exports=mongoose.model("Insurance",InsuranceSchema)