const express=require("express")
const appRouter=express.Router()
const authController=require("../controllers/appAuth")
// const {getPersonalDetails,updatePersonalDetails} =require("../controllers/addressController")

// appRouter.post("/register",authController.register)
appRouter.post('/otp',authController.sendOtp)
appRouter.post('/otp-verify',authController.verifyOtp)
appRouter.post('/login', authController.otpLogin);

appRouter.use(authController.authenticateToken)
appRouter.put('/profile',authController.updateUser);
appRouter.get('/user',authController.getUser);



module.exports=appRouter





