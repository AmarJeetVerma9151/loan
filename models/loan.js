const mongoose = require('mongoose');

const loan = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "user id is required"]
    },
    loanType: {
        type: String,
        enum: [
            'home loans',
            'loan against property',
            'construction loan',
            'business loan',
            'personal loan',
            'car loan',
            'two wheeler loan'
        ],
        required: [true, "select valid loan type"]
    },
    documents: {
        // Aadhaar
        aadhar: {
            aadharNo: {
                type: Number,
                maxlength: 12,
                required: [true, "Aadhar no. is required"],
            },
            aadharImg: [
                {
                    aadharFront: {
                        type: String,
                        required: [true, "Front image required"],
                    },
                    aadharBack: {
                        type: String,
                        required: [true, "Back image required"],
                    },
                },
            ],
        },

        // PAN
        pan: {
            panNo: {
                type: String,
                required: [true, "PAN no. is required"],
            },
            panImg: {
                type: String,
                required: [true, "PAN image is required"],
            },
        },

        // Electricity Bill
        electricity: {
            electricityBillNo: {
                type: String,
                required: [true, "Bill no. is required"],
            },
            img: {
                type: String,
                required: [true, "Image required"],
            },
        },

        // General image
        img: {
            type: String,
            required: [true, "Image required"],
        },

        // Bank Details
        bank: {
            AccNo: {
                type: String,
                required: [true, "Account no. is required"],
            },
            ifsc: {
                type: String,
                required: [true, "IFSC code is required"],
            },
            name: {
                type: String,
                required: [true, "Bank name is required"],
            },
            statementImg: {
                type: String, // can be a URL or file path
            },
        },

        // Salaried Person Details
        salariedPerson: {
            slip: { type: String },
            idCardNo: { type: String },
            idImg: { type: String },
            formNo16: { type: String },
            form16Img: { type: String },
        },


        businessman: {
            gstNo: {
                type: String,
            },
            gstImg: {
                type: String
            },
            itrNo: {
                type: String,
            },
            itrImg: {
                type: String
            },
            form16: {
                type: String
            },
        },

        // Secured Property
        propertydata: { type: String },
    },
    loanAmount: {
        type: Number,
        required: [true, 'loan amount is required']
    },
    status: [
        {
            state: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', "Missing Document"],
                default: 'pending',
              
            },
            remarks: [
                {
                    note: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true })



module.exports = mongoose.model("loan", loan);