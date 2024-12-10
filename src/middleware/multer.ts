import multer from "multer";
import { v4 as uuid } from "uuid";


const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, 'uploads');
   },
  
   filename: (req, file, cb) => {
    const id  = uuid();
    const ext  = file.originalname.split(".").pop();
const fileName  = `${id}.${ext}`
     cb(null, fileName);
   }
 });
 
 export const singleUpload = multer({ storage }).single("photo");

