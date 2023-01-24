import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { returnServerErrorOnUndefinedSecretKey } from "../helpers/auth.helpers";

import { RequestWithUser } from "../types/auth.types";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF USERNAME IS ALREADY IN DATABASE ON LOGIN ] ================================== //
// ========================================================================================= //

export async function checkUsernameExistsOnLogin(
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
// [ CHECKS IF USER HAS VERIFIED THEIR ACCOUNT ] =========================================== //
// ========================================================================================= //

export async function checkAccountVerifiedOnLogin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { existingUser } = request as RequestWithUser;
  if (existingUser.emailVerified) {
    return next();
  } else {
    return response.status(HttpStatusCodes.UNAUTHORIZED).json({
      error:
        "Account is still pending email verification. Please check your email and verify your registration. If your verification code has expired, please request a new one and try again.",
    });
  }
}

// ========================================================================================= //
// [ VERIFIES JWT ACCESS TOKEN ] =========================================================== //
// ========================================================================================= //

// ↓↓↓ Middleware that authenticates user actions via a JWT access token. ↓↓↓
// ↓↓↓ Checks if there is a valid access token (e.g. it exists or supplies the correct secret key). ↓↓↓
// ↓↓↓ If not, user is not authorized to make an action. ↓↓↓
//
// ↓↓↓ This middleware is performed before hitting any endpoint that requires validation credentials. ↓↓↓
type RequestWithAccessToken = { accessToken: string | JwtPayload } & Request;
export async function verifyAccessToken(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const accessToken = request.header("Authorization")?.replace("Bearer ", "");
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      return returnServerErrorOnUndefinedSecretKey(response);
    } else if (!accessToken) {
      return response.status(HttpStatusCodes.UNAUTHORIZED).json({
        error:
          "No access token. Either the token has expired or there was an error in locating it. Please try again.",
      });
    } else {
      const decodedAccessToken = jwt.verify(accessToken, secretKey);
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
