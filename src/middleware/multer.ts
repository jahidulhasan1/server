import multer from "multer";
import { v4 as uuid } from "uuid";


const productStorage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, 'uploads/products/');
   },
  
   filename: (req, file, cb) => {
    const id  = uuid();
    const ext  = file.originalname.split(".").pop();
const fileName  = `${id}.${ext}`
     cb(null, fileName);
   }
 });
 const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/userphoto');
  },
 
  filename: (req, file, cb) => {
   const id  = uuid();
   const ext  = file.originalname.split(".").pop();
const fileName  = `${id}.${ext}`
    cb(null, fileName);
  }
});

 export const singleUserProfUpload = multer({ storage:userStorage }).single("photo");

 export const ProductPhotoUpload = multer({ storage:productStorage }).single("photo");

