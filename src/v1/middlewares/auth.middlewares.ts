import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";

export const SECRET_KEY: Secret = "supersecretkey";

type RequestWithToken = {
  token: string | JwtPayload;
} & Request;

export async function authenticateAccessWithJWT(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const token = request.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      next(new Error("No token."));
    } else {
      const decodedToken = jwt.verify(token, SECRET_KEY);
      (request as RequestWithToken).token = decodedToken;
      next();
    }
  } catch (error) {
    response
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized access." });
  }
}
