import express, { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "../../utils/http-status-codes";

export const authRouter_v1 = express.Router();

authRouter_v1.post(
  "/register",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to register. Please make sure all fields are properly filled in and try again.",
      });
    }
  }
);

authRouter_v1.post(
  "/login",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to log in. Please make sure all fields are properly filled in and try again.",
      });
    }
  }
);

authRouter_v1.post(
  "/logout",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Failed to log out. Please refresh the page and try again.",
      });
    }
  }
);
