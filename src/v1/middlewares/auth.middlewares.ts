import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";

type RequestWithAccessToken = {
  accessToken: string | JwtPayload;
} & Request;

// Middleware that authenticates user actions via a JWT access token.
// Checks if there is a valid access token (e.g. it exists or supplies the correct secret key).
// If not, user is not authorized to make an action.
//
// This middleware is performed before hitting any endpoint that requires validation credentials.
export async function verifyAccessToken(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const accessToken = request.header("Authorization")?.replace("Bearer ", "");
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    if (!accessToken) {
      next(
        new Error(
          "No access token. Either the token has expired or there was an error in locating it."
        )
      );
    } else if (!accessTokenSecretKey) {
      next(new Error("Something went wrong."));
    } else {
      const decodedAccessToken = jwt.verify(accessToken, accessTokenSecretKey);
      // Appending our decoded access token to Express's `request` object for use
      // in the action the user wanted to perform.
      (request as RequestWithAccessToken).accessToken = decodedAccessToken;
      next();
    }
  } catch (error) {
    response
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized access." });
  }
}
