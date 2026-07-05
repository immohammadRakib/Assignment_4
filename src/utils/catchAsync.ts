import { Request, Response } from "express";
import httpStatus from "http-status";



const catchAsync = (fn: Function) => {
    return async (req: Request, res: Response, next: Function) => {
        try {
            await fn(req, res, next);
        }catch (error) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Error registering user',
            error: (error as Error).message
        });
    }
    }
}    


export { catchAsync }