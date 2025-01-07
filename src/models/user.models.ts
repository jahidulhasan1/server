import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

// Define the IUser interface extending Document
export interface IUser extends Document {
  _id:mongoose.Types.ObjectId;
  name: string;
  email: string;
  photo:string;
  password: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual Attribute
  age: number;
}

// Define UserModel interface extending IUser
export interface UserModel extends IUser {
  comparePass(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
}

// Create the user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Please enter your email"],
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    photo: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter your gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter your date of birth"],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual attribute to calculate age
userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob as Date;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePass = async function (
  enteredPass: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPass, this.password);
};

// Export the User model
export const User: Model<UserModel> = mongoose.model<UserModel>(
  "User",
  userSchema
);
