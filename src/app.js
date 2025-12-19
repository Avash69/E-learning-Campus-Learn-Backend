// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import Razorpay from "razorpay"

// const app = express();

// app.use(cors())

// app.use(express.json({limit: "16kb"}))
// app.use(express.urlencoded({extended: true, limit: "16kb"}))
// app.use(express.static("public"))
// app.use(cookieParser())


// export const instance = new Razorpay({
//     key_id: process.env.KEY_ID,
//     key_secret: process.env.KEY_SECRET
// })

// //student routes
// import studentRouter from "./routes/student.routes.js";
// app.use("/api/student", studentRouter)


// //teacher routes
// import teacherRouter from "./routes/teacher.routes.js"
// app.use("/api/teacher", teacherRouter)

// //course routes
// import courseRouter from "./routes/course.routes.js"
// app.use("/api/course", courseRouter)

// import adminRouter from "./routes/admin.routes.js"
// app.use("/api/admin", adminRouter)

// import paymentRouter from "./routes/payment.routes.js"
// app.use("/api/payment", paymentRouter)


// export {app}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import Razorpay from "razorpay";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true })); // allow cookies for cross-origin requests
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Razorpay instance
import dotenv from "dotenv";
dotenv.config(); // load env variables

import express from "express";
import Razorpay from "razorpay";

export const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});


// Routes
import studentRouter from "./routes/student.routes.js";
app.use("/api/student", studentRouter);

import teacherRouter from "./routes/teacher.routes.js";
app.use("/api/teacher", teacherRouter);

import courseRouter from "./routes/course.routes.js";
app.use("/api/course", courseRouter);

import adminRouter from "./routes/admin.routes.js";
app.use("/api/admin", adminRouter);

import paymentRouter from "./routes/payment.routes.js";
app.use("/api/payment", paymentRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export { app };
