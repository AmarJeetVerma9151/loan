const express=require("express")

const router=express.Router()
const auth=require("../controllers/auth")
const adminController=require("../controllers/masterAdmin")
const notificationController=require("../controllers/notificationController")


router.use(auth.authenticateToken)
router.use(auth.authorizeRole("admin"))

router.post('/create',auth.register);
router.get("/agent/:id",adminController.getById)
router.put('/block-agent/:id',adminController.blockAgent);
router.delete('/delete/:id',adminController.deleteById);

router.get("/total-agent",adminController.getTotalAgents)
router.get("/total-approvedloan",adminController.getApprovedLoans)
router.get("/total-pendingloan",adminController.getPendingLoansForAdmin)
router.get("/submitted-percentage",adminController.getApprovedLoansPercentage)

router.get("/loan",adminController.getAll)
router.put("/loan/:id",adminController.updateById)
router.delete("/loan/:id",adminController.deleteById)

//notification
router.post("/message",notificationController.createNotification)
router.get("/message",notificationController.getAllNotificationsWithAgent)

module.exports=router