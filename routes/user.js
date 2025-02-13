const express=require("express");
const userRouter=express.Router();
const { UserModel }=require("../db");
const bcrypt=require("bcrypt");
const {z}=require("zod");
const { userMiddleware } = require("../middleware/user");
const jwt = require("jsonwebtoken");
const{PurchaseModel}=require("../db");
const {JWT_USER_SECRET}=require("../config")
const{CourseModel}=require("../db");
 
userRouter.post("/signup",async function(req,res){
    const requiredbody=z.object({
        firstname:z.string(),
        lastname:z.string(),
        password: z.string().min(5).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/), // Password must include upper/lower case, numbers, and special characters)
        email:z.string().min(10).max(30).email(),
    })
    const parsedatawithsucess=requiredbody.safeParse(req.body);
    if(!parsedatawithsucess.success){
        res.status(403).json({
            message:"invalid cred",
            error:parsedatawithsucess.error,
        })
        return ;
    }
    const {firstname,lastname,password,email}=req.body; // destructing req.body
    try {
        const hashedpassword=await bcrypt.hash(password,10);
        await UserModel.create({
            firstname:firstname,
            lastname:lastname,
            password:hashedpassword,
            email:email
        })
        res.json({
            message:"you are signed up.."
        })
        console.log("you are welcomed")
    } catch (error) {
        res.status(403).json({
            message:"already exist",
        })
    }
})

userRouter.post("/signin",async function(req,res){
    const{email,password}=req.body;
    const response= await UserModel.findOne({
        email:email,
    })
    if(!response){
        res.status(403).json({
            message: "go back nd sign up first"
        })
        return;
    }
    const passwordmatch=await bcrypt.compare(password,response.password);
    if(passwordmatch){
        const token=jwt.sign({
            id:response._id.toString(),
        },JWT_USER_SECRET);
        res.json({
            token
        })
    }else{
        res.status(403).json({
            message:"invalid creds",
        })}
})

userRouter.get("/purchases",userMiddleware,async function(req,res){
    const userId=req.userId;
    const purchasedcourse= await  PurchaseModel.find({
        userId,
    })
    if (!purchasedcourse) {
        return res.status(404).json({
            message: "No purchases found", // Error message for no purchases found
        });
    }
        // If purchases are found, extract the courseIds from the found purchases
        const purchasesCourseIds = purchasedcourse.map((purchasedcourse) =>purchasedcourse.courseId);

        // Find all course details associated with the courseIds
        const coursedata = await CourseModel.find({
            _id: { $in: purchasesCourseIds }, // Querying courses using the extracted course IDs
        });
    
    res.json({
        message:"all purchased course",
       coursedata,
    })
})

//MONGO_URL="mongodb+srv://prajapativik3976:537hBcQXhCpge2S6@cluster0.n0nop.mongodb.net/course-selling-app"
// JWT_USER_SECRET="user_hai"
// JWT_ADMIN_SECRET="admin_hai"

module.exports={
    userRouter:userRouter,
};