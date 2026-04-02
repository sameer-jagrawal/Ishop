 require('dotenv').config();
 const express = require("express");
 const cors = require("cors");
 const mongoose = require("mongoose");
 const app = express()
 app.use(cors({origin: "http://localhost:3000"}))
 app.use(express.json());
 app.use(express.static("./public"))
 app.use("/api/category", require("./routers/categoryrouter"))


 mongoose.connect(process.env.MONGODB_URL).then(
    ()=>{
        console.log("Database connected");
        app.listen(
            process.env.PORT,
            ()=>{
                console.log("server is running")
            }
        )
        
    }
 ).catch(
    (error)=>{
        console.log("Database not connected")
    }
 )