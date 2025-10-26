const mongoose=require("mongoose")


const notificationSchema=new mongoose.Schema({
    agentName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:true
    },
    attachement:{
        type:String,
        required:true
    },
    message:{
        type:String,
        require:true
    }
},{timestamps:true})

module.exports=mongoose.model("notification",notificationSchema)