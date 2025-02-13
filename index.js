require('dotenv').config()
const express=require("express");
const mongoose=require("mongoose");
const {userRouter}=require("./routes/user");
const {adminRouter}=require("./routes/admin");
const {courseRouter}=require("./routes/course");
const app=express();
app.use(express.json());

// middleware to handle routing 
//It applies middleware to all HTTP methods (GET, POST, PUT, DELETE, etc.) for that path.
// This is the base URL path that will be prefixed to all routes inside userRouter.
// ex ; If userRouter has a GET /profile route, the full path will be GET /api/v1/user/profile.
app.use("/api/v1/user",userRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/course",courseRouter);

/// for better structuring we are using express routing  instead of creating it here   
mongoose.connect(process.env.MONGO_URL)
app.listen(3000); 
