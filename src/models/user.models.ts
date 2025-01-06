import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
interface IUser extends Document {
 
  name: string;
  email: string;
  photo: string;
  password: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual Attribute
  age: number;
}

const userSchema = new mongoose.Schema(
  {
   
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    email: {
      type: String,
      unique: [true, "Email already Exist"],
      required: [true, "Please enter Name"],
      validate: validator.default.isEmail,
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
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
      required: [true, "Please enter Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter Date of birth"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});

// after adding user data in db hash the pass
userSchema.pre("save", async function (next) {
  // do stuff
  if (!this.isModified("password")) {
    // hash the password
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.comparePass = async function (enteredPass: string) {
  return await bcrypt.compare(enteredPass, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
