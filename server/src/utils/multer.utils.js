import multer from "multer";

//NOTE: Using memory Storage as we will send the files in Buffer memory
export const upload = multer({ storage: multer.memoryStorage() });
