// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   razorpay_order_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_payment_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_signature: {
//     type: String,
//     required: true,
//   },
//   courseID: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Course",
//     required: true,
//   },
//   studentID: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Student",
//     required: true,
//   },
// }, { timestamps: true });

// export const Payment = mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    pidx: {
      type: String,
      required: true,
      unique: true,
    },
    purchase_order_id: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "completed", "failed", "pending"],
      default: "initiated",
    },
    khalti_response: {
      type: mongoose.Schema.Types.Mixed,
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);