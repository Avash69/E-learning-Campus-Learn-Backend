// import mongoose, { Schema } from "mongoose";

// const contactSchema = new Schema({
//     name:{
//         type:String,
//         required:true,
//     },

//     email:{
//         type:String,
//         required:true,
//     },
//     message:{
//         type:String,
//         required:true,
//     },
//     status: {
//         type: Boolean,
//         default: false
//     }
// })

// const contact = mongoose.model("contact", contactSchema)

// export {contact}

import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Contact = mongoose.model("Contact", contactSchema);

export { Contact };
