require("dotenv").config();
const express = require("express");
const cors = require("cors")
const appRoutes = require('./routes/routes')
const userRoutes = require('./routes/userRoutes')
const mongoose = require("mongoose")
const path = require("path")

const app = express();

app.use(express.json()); 
app.use(express.urlencoded());

const corsOpts = {
    origin: '*',
    credentials: true,
    methods: ['GET','POST','HEAD','PUT','PATCH','DELETE'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Type']
};

app.use(cors(corsOpts));

app.use('/api/routes', appRoutes);
app.use('/api/userRoutes', userRoutes);
   
 



mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("connected to the database");

    app.listen(process.env.PORT, function(){
        console.log(`port running on port ${process.env.PORT}`)
    });
   
}).catch( (err) => {console.log(err)})

