import express, { NextFunction, Request, Response } from "express";

export const authRouter_v1 = express.Router();

authRouter_v1.post("/register", async (request: Request, response: Response, next: NextFunction) => {
	try {
		
	} catch (error) {
		next(new Error("There was an error in registering your account. Please make sure all fields are properly filled in and try again."))
	}
})

authRouter_v1.post("/login", async(request: Request, response: Response, next: NextFunction) => {
	try {
		
	} catch (error) {
		next(new Error("Login attempt failed. Please make sure all fields are properly filled in and try again."))
	}
})
