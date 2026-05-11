import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

export { upload };
