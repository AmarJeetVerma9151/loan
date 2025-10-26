const  express =  require("express");
const app  =  express();
const mongoose = require('mongoose');
const config  =  require("./config");
const auth = require('./routes/auth')
const customer = require('./routes/customer.js'); 
const router = require('./routes/agent');
const admin = require('./routes/admin');
const cors = require('cors')
const appRouter = require("./routes/appAuth.js");


app.use(express.json());
app.use(cors());

mongoose.connect(config.database.dbConnectionString)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth',auth)//for desktop
app.use('/api/customer',customer)
app.use('/api/agent',router),
app.use('/api/admin',admin)
app.use('/api/appAuth',appRouter)//for app...


app.use((req,res)=>{
     res.status(404).json({"message":"route not found"})
})

app.listen(config.http.port , ()=>{
     console.log("Server started successfully at port " + config.http.port)
})