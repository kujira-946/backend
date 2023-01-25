import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import * as Helpers from "../helpers/auth.helpers";
import * as ResponseHelpers from "../helpers/http.helpers";
import { RequestWithFoundUser } from "../types/auth.types";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF USERNAME IS IN DATABASE & PASSES IT TO THE NEXT MIDDLEWARE ] ================ //
// ========================================================================================= //

type RequestWithUsernameInParams = Request<{ username: string } & {} & {}>;

export async function checkUsernameExists(
  request: RequestWithUsernameInParams,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: request.params.username },
    });
    (request as RequestWithFoundUser & RequestWithUsernameInParams).foundUser =
      user;
    return next();
  } catch (error) {
    return ResponseHelpers.respondWithClientError(response, "bad request", {
      body: `An account with username ${request.params.username} does not exist. Please register to create a new account.`,
    });
  }
}

// ========================================================================================= //
// [ CHECKS IF USER HAS VERIFIED THEIR ACCOUNT ] =========================================== //
// ========================================================================================= //

export async function checkAccountVerifiedOnLoginAttempt(
  request: RequestWithUsernameInParams,
  response: Response,
  next: NextFunction
) {
  const { foundUser } = request as RequestWithFoundUser &
    RequestWithUsernameInParams;

  if (foundUser.emailVerified) {
    return next();
  } else {
    return ResponseHelpers.respondWithClientError(response, "unauthorized", {
      body: "Account is still pending email verification. Please check your email and verify your registration. If your verification code has expired, please request a new one and try again.",
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
    return Helpers.handleSecretKeysExist(
      response,
      function (_: string, authSecretKey: string) {
        const accessToken = request
          .header("Authorization")
          ?.replace("Bearer ", "");

        if (!accessToken) {
          return ResponseHelpers.respondWithClientError(
            response,
            "unauthorized",
            {
              body: "No access token. Either the token has expired or there was an error in locating it. Please try again.",
            }
          );
        } else {
          const decodedAccessToken = jwt.verify(accessToken, authSecretKey);
          // ↓↓↓ Appending our decoded access token to Express's `request` object for use. ↓↓↓
          // ↓↓↓ in the action the user wanted to perform. ↓↓↓
          (request as RequestWithAccessToken).accessToken = decodedAccessToken;
          return next();
        }
      }
    );
  } catch (error) {
    return ResponseHelpers.respondWithClientError(response, "unauthorized", {
      body: "Unauthorized access.",
    });
  }
}
