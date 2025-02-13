const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
// for  data of user 
const userSchema=new Schema({
    firstname:String,
    lastname:String,
    email:{type:String,unique:true},
    password:String,
})
 // for data of course creator 

const adminSchema=new Schema({
    firstname:String,
    lastname:String,
    email:{type:String,unique:true},
    password:String,
})

//// Define the Course schema with title, description, price, imageUrl, and creatorId fields
const courseSchema=new Schema({
    title:String,
    price:Number,
    description:String,
    imageurl:String,
    creatorID:ObjectId,
})

// couseres puchases by the users
const purchaseSchema=new Schema({
    userId:ObjectId,
    courseId:ObjectId,
})

 const UserModel = mongoose.model('User', userSchema);
 const AdminModel = mongoose.model('Admin', adminSchema);
 const CourseModel = mongoose.model('Course', courseSchema);
 const PurchaseModel = mongoose.model('Purchase', purchaseSchema);

 module.exports={
    UserModel,
    AdminModel,
    PurchaseModel,
    CourseModel
 }

