// import dotenv from "dotenv"
// import db from './database/db.js';
// import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })

// console.log(`${process.env.DB_NAME}`);


// db()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log(" mongodb connection failed !!! ", err);
// })
import dotenv from "dotenv";
import db from "./database/db.js";
import { app } from "./app.js";

// Load environment variables
dotenv.config({ path: "./.env" });

console.log("Database Name:", process.env.DB_NAME);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await db(); // assuming db() connects to MongoDB
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`⚙️ Server is running on port: ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed!", err);
    process.exit(1); // exit process if DB connection fails
  }
};

startServer();
