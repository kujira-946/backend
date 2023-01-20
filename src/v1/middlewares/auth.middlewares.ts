import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";
import { User } from "../types/users.types";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ LOGIN : MAKING SURE CLIENT-PROVIDED USERNAME EXISTS ] ================================= //
// ========================================================================================= //

export type RequestWithUser = { existingUser: User } & Request;
export async function verifyLoginUsernameMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: request.body.username },
    });
    (request as RequestWithUser).existingUser = user;
    return next();
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "An account with that username does not exist. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ VERIFYING JWT ACCESS TOKEN ] ========================================================== //
// ========================================================================================= //

// ↓↓↓ Middleware that authenticates user actions via a JWT access token. ↓↓↓
// ↓↓↓ Checks if there is a valid access token (e.g. it exists or supplies the correct secret key). ↓↓↓
// ↓↓↓ If not, user is not authorized to make an action. ↓↓↓
//
// ↓↓↓ This middleware is performed before hitting any endpoint that requires validation credentials. ↓↓↓
type RequestWithAccessToken = { accessToken: string | JwtPayload } & Request;
export async function verifyAccessTokenMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const accessToken = request.header("Authorization")?.replace("Bearer ", "");
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    if (!accessToken) {
      return next(
        new Error(
          "No access token. Either the token has expired or there was an error in locating it."
        )
      );
    } else if (!accessTokenSecretKey) {
      return next(new Error("Something went wrong."));
    } else {
      const decodedAccessToken = jwt.verify(accessToken, accessTokenSecretKey);
      // ↓↓↓ Appending our decoded access token to Express's `request` object for use. ↓↓↓
      // ↓↓↓ in the action the user wanted to perform. ↓↓↓
      (request as RequestWithAccessToken).accessToken = decodedAccessToken;
      return next();
    }
  } catch (error) {
    return response
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized access." });
  }
}
