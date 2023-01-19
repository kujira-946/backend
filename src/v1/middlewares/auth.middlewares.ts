import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";

type RequestWithAccessToken = {
  accessToken: string | JwtPayload;
} & Request;

export async function authenticateAccessWithJWT(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const accessToken = request.header("Authorization")?.replace("Bearer ", "");
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!accessToken) {
      next(new Error("No access token."));
    } else if (!accessTokenSecretKey) {
      next(new Error("No key."));
    } else {
      const decodedToken = jwt.verify(accessToken, accessTokenSecretKey);
      (request as RequestWithAccessToken).accessToken = decodedToken;
      next();
    }
  } catch (error) {
    response
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized access." });
  }
}
