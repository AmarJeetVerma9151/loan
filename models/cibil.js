const mongoose=require("mongoose")


const cibilSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
     required:[true,"user id is required"]

    },
    name:{
        type:String,
        required:true
    },
    relationOccupation:{
        type:String,
        required:[true,'occupation required']
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        enum:["male","female","other"],
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    alternateNo:{
        type:Number,
        required:true
    },
    witnessName:{
        type:String,
        require:true
    },
    witnessNo:{
        type:Number,
        require:true
    },
    relationWithWitness:{
        type:String
    },
    occupation:{
        type:String,
        required:true
    },
    monthlyIncome:{
        type:Number,
        required:true
    },
    noFamilyMembers:{
        type:String,

    },
    agent:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"user"

    }

},{timestamps:true})

module.exports=mongoose.model("cibil",cibilSchema)