const express=require("express")
const router=express.Router()
const {agentbaseController}=require("../controllers/loanController")
const auth=require("../controllers/auth")
const {agentInsuranceController} = require("../controllers/InsuranceController")
const {agentbaseControllerCreditCard}=require("../controllers/cardController")

router.use(auth.authenticateToken)
router.use(auth.authorizeRole("agent"))


//loan
router.get("/loan",agentbaseController.get)
router.get("/loan/:id",agentbaseController.getById)
router.get("/pending-count",agentbaseController.getPendingLoansCount)
router.get("/missing-document",agentbaseController.getMissingDocumentsCount)
router.get("/accepted-loan",agentbaseController.getAcceptedLoansCount)
router.get("/total-percentage",agentbaseController.getAcceptedLoansPercentage)
router.put("/loan/:id",agentbaseController.updateById)
router.delete("/delete/:id",agentbaseController.deleteById)


//ansurance
router.get("/insurance",agentInsuranceController.get)
router.get("/insurance/:id",agentInsuranceController.getById)
router.put("/insurance/:id",agentInsuranceController.updateById)
router.delete("/insurance/:id",agentInsuranceController.deleteById)


//credit-card
router.get("/credit",agentbaseControllerCreditCard.get)
router.get("/credit/:id",agentbaseControllerCreditCard.getById)
router.put("/credit/:id",agentbaseControllerCreditCard.updateById)
router.delete("/credit/:id",agentbaseControllerCreditCard.deleteById)





module.exports=router