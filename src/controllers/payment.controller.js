// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { instance } from "../app.js";
// import crypto from "crypto";
// import { payment } from "../models/payment.model.js";
// import { Teacher } from "../models/teacher.model.js";


// // ===============================
// // CREATE PAYMENT ORDER
// // ===============================

// const coursePayment = asyncHandler(async (req, res) => {
//   const { fees } = req.body;

//   if (!fees) throw new ApiError(400, "Fees is required");

//   const options = {
//     amount: Number(fees) * 100, // Razorpay uses paise
//     currency: "NPR",
//     receipt: "receipt_" + Date.now()
//   };

//   const order = await instance.orders.create(options);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, order, "Order created"));
// });


// // ===============================
// // GET KEY
// // ===============================

// const getkey = asyncHandler(async (req, res) => {
//   return res
//     .status(200)
//     .json(new ApiResponse(200, { key: process.env.KEY_ID }, "Razorpay key fetched"));
// });


// // ===============================
// // PAYMENT CONFIRMATION
// // ===============================

// const coursePaymentConfirmation = asyncHandler(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     throw new ApiError(400, "Missing Razorpay fields");
//   }

//   const studentID = req.student?._id || req.Student?._id;
//   if (!studentID) throw new ApiError(400, "Student ID missing");

//   const courseID = req.params.courseID;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.KEY_SECRET)
//     .update(body)
//     .digest("hex");

//   if (expectedSignature !== razorpay_signature) {
//     throw new ApiError(400, "Payment signature mismatch");
//   }

//   const orderDetails = await payment.create({
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     courseID,
//     studentID,
//   });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, orderDetails, "Payment confirmed"));
// });


// // ===============================
// // UPDATE TEACHER BALANCE
// // ===============================

// const teacherAmount = asyncHandler(async (req, res) => {
//   const teacher = req.teacher;

//   const result = await Teacher.aggregate([
//     { $match: { _id: teacher._id } },
//     { $unwind: "$enrolledStudent" },
//     { $match: { "enrolledStudent.isNewEnrolled": true } },
//     { $group: { _id: null, count: { $sum: 1 } } }
//   ]);

//   const newStudents = result?.[0]?.count || 0;

//   // Increase balance
//   await Teacher.findByIdAndUpdate(
//     teacher._id,
//     { $inc: { Balance: newStudents * 500 } },
//     { new: true }
//   );

//   // Update isNewEnrolled → false
//   const updatedTeacher = await Teacher.findOneAndUpdate(
//     { _id: teacher._id },
//     { $set: { "enrolledStudent.$[elem].isNewEnrolled": false } },
//     { new: true, arrayFilters: [{ "elem.isNewEnrolled": true }] }
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedTeacher, "Teacher balance updated"));
// });


// // ===============================
// // WITHDRAW AMOUNT
// // ===============================

// const withdrawAmount = asyncHandler(async (req, res) => {
//   const teacherId = req.teacher._id;
//   const amount = Number(req.body.amount);

//   if (!amount || amount <= 0) {
//     throw new ApiError(400, "Invalid withdrawal amount");
//   }

//   const teacher = await Teacher.findById(teacherId);
//   if (!teacher) throw new ApiError(404, "Teacher not found");

//   if (teacher.Balance < amount) throw new ApiError(400, "Insufficient balance");

//   teacher.Balance -= amount;
//   teacher.WithdrawalHistory.push({ amount, date: new Date() });

//   await teacher.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, teacher, "Withdrawal successful"));
// });



// export {
//   coursePayment,
//   getkey,
//   coursePaymentConfirmation,
//   teacherAmount,
//   withdrawAmount
// };


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Teacher } from "../models/teacher.model.js";
import axios from "axios";

// ===============================
// INITIATE KHALTI PAYMENT
// ===============================

const coursePayment = asyncHandler(async (req, res) => {
  const { fees, productName, productId } = req.body;
  const courseID = req.params.courseID;
  const studentID = req.student?._id || req.Student?._id;

  if (!fees) throw new ApiError(400, "Fees is required");
  if (!studentID) throw new ApiError(400, "Student ID missing");
  if (!courseID) throw new ApiError(400, "Course ID missing");

  // Khalti payment initiation payload
  const payload = {
    return_url: `${process.env.BACKEND_URL}/api/payment/khalti-callback`,
    website_url: process.env.FRONTEND_URL,
    amount: Number(fees) * 100, // Khalti uses paisa (1 NPR = 100 paisa)
    purchase_order_id: `ORDER_${Date.now()}_${courseID}`,
    purchase_order_name: productName || "Course Enrollment",
    customer_info: {
      name: req.student?.Firstname + " " + req.student?.Lastname,
      email: req.student?.Email,
    },
    // Store additional data for later verification
    product_details: [
      {
        identity: productId || courseID,
        name: productName || "Course",
        total_price: Number(fees) * 100,
        quantity: 1,
      },
    ],
  };

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Store payment initiation in database
    await Payment.create({
      pidx: response.data.pidx,
      purchase_order_id: payload.purchase_order_id,
      amount: fees,
      courseID,
      studentID,
      status: "initiated",
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          payment_url: response.data.payment_url,
          pidx: response.data.pidx,
        },
        "Payment initiated successfully"
      )
    );
  } catch (error) {
    console.error("Khalti initiation error:", error.response?.data || error);
    throw new ApiError(
      500,
      error.response?.data?.detail || "Failed to initiate payment"
    );
  }
});

// ===============================
// GET KHALTI PUBLIC KEY
// ===============================

const getkey = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { key: process.env.KHALTI_PUBLIC_KEY },
        "Khalti public key fetched"
      )
    );
});

// ===============================
// KHALTI PAYMENT CALLBACK/VERIFICATION
// ===============================

const khaltiCallback = asyncHandler(async (req, res) => {
  const { pidx, status, purchase_order_id, transaction_id } = req.query;

  if (!pidx) {
    throw new ApiError(400, "Payment identifier missing");
  }

  try {
    // Verify payment with Khalti
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { pidx },
      {
        $set: {
          status: paymentData.status,
          transaction_id: paymentData.transaction_id || transaction_id,
          khalti_response: paymentData,
        },
      },
      { new: true }
    );

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    // If payment is successful, redirect to success page
    if (paymentData.status === "Completed") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?pidx=${pidx}&status=success`
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?pidx=${pidx}&status=failed`
      );
    }
  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?status=error`
    );
  }
});

// ===============================
// PAYMENT CONFIRMATION (Frontend calls this after redirect)
// ===============================

const coursePaymentConfirmation = asyncHandler(async (req, res) => {
  const { pidx } = req.body;
  const courseID = req.params.courseID;
  const studentID = req.student?._id || req.Student?._id;

  if (!pidx) {
    throw new ApiError(400, "Payment identifier missing");
  }

  try {
    // Verify payment with Khalti
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    if (paymentData.status !== "Completed") {
      throw new ApiError(400, "Payment not completed");
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { pidx, courseID, studentID },
      {
        $set: {
          status: "completed",
          transaction_id: paymentData.transaction_id,
          khalti_response: paymentData,
        },
      },
      { new: true }
    );

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, payment, "Payment verified successfully")
      );
  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error);
    throw new ApiError(
      500,
      error.response?.data?.detail || "Payment verification failed"
    );
  }
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
    { $group: { _id: null, count: { $sum: 1 } } },
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

  if (teacher.Balance < amount)
    throw new ApiError(400, "Insufficient balance");

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
  khaltiCallback,
  coursePaymentConfirmation,
  teacherAmount,
  withdrawAmount,
};