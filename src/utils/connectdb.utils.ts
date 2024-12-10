import mongoose from "mongoose";

export const connectDB = async (uri:string) => {
  try {
    await mongoose.connect(uri, {
      dbName: "Ecommerce_24",
     
    });
   
  } catch (error) {
    console.error("DB Connection Error:", error);
    process.exit(1); // Exit the process with failure
  }
};
