const express=require("express");
const courseRouter=express.Router();
const { userMiddleware } = require("../middleware/user");

const{PurchaseModel}=require("../db");
const{CourseModel}=require("../db");

courseRouter.post("/purchase",userMiddleware,async function (req, res) {
    const userId=req.userId;
    const {courseId}=req.body;
    // If courseId is not provided in the request body, return a 400 error response to the client
    if (!courseId) {
        return res.status(400).json({
            message: "Please provide a courseId", // Error message sent back to the client
        });
    }

    // Check if the user has already purchased the course by querying the purchaseModel with courseId and userId
    const existingPurchase = await PurchaseModel.findOne({
        courseId: courseId,
        userId: userId,
    });

    // If the user has already purchased the course, return a 400 error response to the client
    if (existingPurchase) {
        return res.status(400).json({
            message: "You have already bought this course",
        });
    }

    // Try to create a new purchase entry in the database with the provided courseId and userId
    await PurchaseModel.create({
        courseId: courseId, // The ID of the course being purchased
        userId: userId,     // The ID of the user making the purchase
    });

    // If the purchase is successful, return a 201 status with a success message to the client
    res.status(201).json({
        message: "You have successfully bought the course", // Success message after purchase
    });
});

courseRouter.get("/preview",async function (req, res) {
     const allcourses=await CourseModel.find({})
    res.json({
        message: "all courses",
        allcourses,
    });
});

// Export the courseRouter so that it can be used in other files
module.exports = {
    courseRouter

};
