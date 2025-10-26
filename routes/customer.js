const express=require("express")
const router=express.Router()
const {baseController}=require("../controllers/loanController")
const auth = require("../controllers/auth")
const {insuranceController}=require("../controllers/InsuranceController")
const cibilController=require("../controllers/cibilController")
const {creditCardController}=require("../controllers/cardController")

router.use(auth.authenticateToken)
router.use(auth.authorizeRole("customer"))

//loan
router.post("/loan",baseController.createLoan)
router.get("/loan",baseController.get)
router.get("/loan/:id",baseController.getById)

//Insurance
router.post("/insurance",insuranceController.createInsurance)
router.get("/insurance",insuranceController.get)
router.get("/insurance/:id",insuranceController.getById)

//cibil
router.post("/cibil",cibilController.create)
router.get("/cibil",cibilController.get)

//credit card
router.post("/credit-card",creditCardController.createCreditCard)
router.get("/credit-card",creditCardController.getAll)
router.get("/credit-card/:id",creditCardController.getById)




module.exports=router