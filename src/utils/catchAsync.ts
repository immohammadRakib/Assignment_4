import { Request, Response } from "express";



const catchAsync = (fn: Function) => {
    return async (req: Request, res: Response, next: Function) => {
        try {
            await fn(req, res, next);
        }catch (error) {
            next(error); 
        }
    }
}    


export { catchAsync }