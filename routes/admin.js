const express=require("express");
const adminRouter=express.Router();
const bcrypt=require("bcrypt");
const {z}=require("zod");
const {adminMiddleware} = require("../middleware/admin");
const jwt = require("jsonwebtoken");

const {JWT_ADMIN_SECRET}=require("../config")

// donot know y we r using this..
const { AdminModel } = require("../db");
const {CourseModel} = require("../db");



adminRouter.post("/signup",async function(req,res){
    const requiredbody=z.object({
        firstname:z.string(),
        lastname:z.string(),
        password: z.string().min(5).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,20}$/),
        email:z.string().email(),
    })
    const parsedatawithsucess=requiredbody.safeParse(req.body);
    if(!parsedatawithsucess.success){
        res.json({
            message:"invalid cred",
            error:parsedatawithsucess.error,
        })
        return ;
    }
    const{firstname,lastname,password,email}=req.body; // destructing req.body
    try {
        const hashedpassword=await bcrypt.hash(password,5);
        await AdminModel.create({
            firstname:firstname,
            lastname:lastname,
            password:hashedpassword,
            email:email
        })
        res.json({
            message:"you are signed up.."
        })
    } catch (error) {
        res.status(403).json({
            message:"already exist",
        })
    }
}) 

adminRouter.post("/signin",async function(req,res){
    const{email,password}=req.body;
    const response= await AdminModel.findOne({
        email,
    })
    if(!response){
        res.status(403).json({
            message: "go back nd sign up first"
        })
        return;
    }
    const passwordmatch= await bcrypt.compare(password,response.password);
    if(passwordmatch){
        const token=jwt.sign({
            id:response._id.toString(),
        },JWT_ADMIN_SECRET);
        res.json({
            token
        })
    }else{
        res.status(403).json({
            message:"invalid creds",
        })
    }
})

adminRouter.post("/course",adminMiddleware,async function(req,res){
    const adminId=req.adminId;
    const {title,price,description,imageurl}=req.body;
     const course=await CourseModel.create({
        title,
        description,
        price,
        imageurl,
        creatorID:adminId,
    })
    res.json({
        message:"course added",
        cousreid:course._id,
    })
})

adminRouter.put("/course",adminMiddleware,async function(req,res){
    const adminId=req.adminId;
    const {title,price,description,imageurl,course_id}=req.body;
  

    /// checking correct creator is updTING COURSE info or not..
    const course = await CourseModel.findOne({ _id: course_id, creatorID: adminId });
    if (!course) {
        return res.status(404).json({ message: "Course not found!" });
    }
    await CourseModel.updateOne(
        { _id: course_id, creatorId: adminId }, 
        { 
            $set: {  //  Use $set to update fields properly
                title: title || course.title,
                description: description || course.description,
                imageUrl: imageurl || course.imageUrl, // Fix casing here
                price: price || course.price,
            } 
        }
    );
    res.json({
        message:"course updated",
        cousreid:course._id,
    })
})

adminRouter.get("/course/bulk",adminMiddleware,async function(req,res){
    const adminId=req.adminId;
     const courses=await CourseModel.find({
        creatorID:adminId,
    })
    res.json({
        message:"course added",
        courses
    })
})

adminRouter.delete("/course/:id", adminMiddleware, async function (req, res) {
    const adminId = req.adminId;
    const courseId = req.params.id;

    // Find and delete only if the admin is the creator
    const deletedCourse = await CourseModel.findOneAndDelete({ _id: courseId, creatorId: adminId });

    if (!deletedCourse) {
        return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    res.json({
        message: "Course deleted successfully"
    });
});



module.exports={
    adminRouter:adminRouter,
};