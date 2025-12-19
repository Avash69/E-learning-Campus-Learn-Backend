// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import {instance}  from "../app.js"
// import crypto from "crypto"
// import {payment} from "../models/payment.model.js"
// import { Teacher } from "../models/teacher.model.js";


// const coursePayment = asyncHandler(async(req,res)=>{
//     const {fees, } = req.body

//     if(!fees){
//       throw new ApiError(400,"fees is required")
//     }

//     const options = {
//         amount: fees,  // amount in the smallest currency unit
//         currency: "INR",
//         receipt: "order_rcptid_11"
//       };
//       const order = await instance.orders.create(options)

//       return res
//       .status(200)
//       .json( new ApiResponse(200, order,"order fetched"))
// })


// const getkey = asyncHandler(async(req,res)=>{
//   return res
//   .status(200)
//   .json(new ApiResponse(200,{key:process.env.KEY_ID}, "razor key fetched"))
// })


// const coursePaymentConfirmation = asyncHandler(async(req,res)=>{
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;
  
//   const studentID = req.Student._id
//   const courseID = req.params.courseID
//   console.log(courseID)

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.KEY_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {

//     const orderDetails = await payment.create({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       courseID, 
//       studentID,
//     });

//     return res
//     .status(200)
//     .json(new ApiResponse(200,{orderDetails}, "payment confirmed" ))
//   } else {
//     throw new ApiError(400, "payment failed")
//   }
// })


// const teacherAmount = asyncHandler(async(req,res)=>{
//   const teacher = req.teacher

//   const newEnrolledStudentCount = await Teacher.aggregate([
//     {
//       $match: { _id: teacher._id }
//     },
//     {
//       $unwind: "$enrolledStudent"
//     },
//     {
//       $match: { "enrolledStudent.isNewEnrolled": true }
//     },
//     {
//       $group: {
//         _id: null,
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   const count = newEnrolledStudentCount.length > 0 ? newEnrolledStudentCount[0].count : 0;


//   await Teacher.findByIdAndUpdate(
//     teacher._id,
//     { $inc: { Balance: count * 500 } },
   
//   );

//   const newTeacher = await Teacher.findOneAndUpdate(
//     { _id: teacher._id, "enrolledStudent.isNewEnrolled": true },
//     { $set: { "enrolledStudent.$[elem].isNewEnrolled": false } },
//     { 
//         new: true,
//         arrayFilters: [{ "elem.isNewEnrolled": true }],
//     }
//   );

//   if(!newTeacher){
//     const newTeacher = await Teacher.findById(
//       teacher._id
//     )

//     return res
//     .status(200)
//     .json(new ApiResponse(200, {newTeacher}, "balance"))
//   }


//   return res
//   .status(200)
//   .json(new ApiResponse(200, {newTeacher}, "balance"))
  
// })


// const withdrawAmount = asyncHandler(async(req,res)=>{

//   const teacherId = req.teacher._id
//   const amount = req.body.amount

//   console.log(amount);

//   const teacher = await Teacher.findById(teacherId);

//   if (!teacher) {
//     return res.status(404).json({ message: "Teacher not found" });
//   }

//   if (teacher.Balance < amount) {
//     return res.status(400).json({ message: "Insufficient balance" });
//   }

//   teacher.Balance -= amount;
//   teacher.WithdrawalHistory.push({ amount });
//   await teacher.save();

//   const newTeacher = await Teacher.findById(teacherId)

//   return res
//   .status(200)
//   .json(new ApiResponse(200, {newTeacher}, "balance"))
  
// })



// export {coursePayment, getkey, coursePaymentConfirmation, teacherAmount, withdrawAmount}


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { instance } from "../app.js";
import crypto from "crypto";
import { payment } from "../models/payment.model.js";
import { Teacher } from "../models/teacher.model.js";


// ===============================
// CREATE PAYMENT ORDER
// ===============================

const coursePayment = asyncHandler(async (req, res) => {
  const { fees } = req.body;

  if (!fees) throw new ApiError(400, "Fees is required");

  const options = {
    amount: Number(fees) * 100, // Razorpay uses paise
    currency: "NPR",
    receipt: "receipt_" + Date.now()
  };

  const order = await instance.orders.create(options);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created"));
});


// ===============================
// GET KEY
// ===============================

const getkey = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { key: process.env.KEY_ID }, "Razorpay key fetched"));
});


// ===============================
// PAYMENT CONFIRMATION
// ===============================

const coursePaymentConfirmation = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay fields");
  }

  const studentID = req.student?._id || req.Student?._id;
  if (!studentID) throw new ApiError(400, "Student ID missing");

  const courseID = req.params.courseID;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment signature mismatch");
  }

  const orderDetails = await payment.create({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseID,
    studentID,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orderDetails, "Payment confirmed"));
});


// ===============================
// UPDATE TEACHER BALANCE
// ===============================

const teacherAmount = asyncHandler(async (req, res) => {
  const teacher = req.teacher;

  const result = await Teacher.aggregate([
    { $match: { _id: teacher._id } },
    { $unwind: "$enrolledStudent" },
    { $match: { "enrolledStudent.isNewEnrolled": true } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  const newStudents = result?.[0]?.count || 0;

  // Increase balance
  await Teacher.findByIdAndUpdate(
    teacher._id,
    { $inc: { Balance: newStudents * 500 } },
    { new: true }
  );

  // Update isNewEnrolled → false
  const updatedTeacher = await Teacher.findOneAndUpdate(
    { _id: teacher._id },
    { $set: { "enrolledStudent.$[elem].isNewEnrolled": false } },
    { new: true, arrayFilters: [{ "elem.isNewEnrolled": true }] }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTeacher, "Teacher balance updated"));
});


// ===============================
// WITHDRAW AMOUNT
// ===============================

const withdrawAmount = asyncHandler(async (req, res) => {
  const teacherId = req.teacher._id;
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid withdrawal amount");
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new ApiError(404, "Teacher not found");

  if (teacher.Balance < amount) throw new ApiError(400, "Insufficient balance");

  teacher.Balance -= amount;
  teacher.WithdrawalHistory.push({ amount, date: new Date() });

  await teacher.save();

  return res
    .status(200)
    .json(new ApiResponse(200, teacher, "Withdrawal successful"));
});



export {
  coursePayment,
  getkey,
  coursePaymentConfirmation,
  teacherAmount,
  withdrawAmount
};
