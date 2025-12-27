import { Types } from "mongoose";
// Extiende tipos globales de TypeScript
declare global {
  //Accede al namespace de Express 
  namespace Express {
    //Extiende el tipo Request de Express
    interface Request {
      //Añade el tipo user a Request con los campos que necesitemos
      user?: {
        _id: Types.ObjectId;
        username?: string;
        email?: string;
        isAdmin?: boolean;
      };
    }
  }
}

export {};
