import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import * as Types from "../types/auth.types";
import * as Helpers from "../helpers/auth.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import { AuthErrors } from "../utils/auth.utils";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF USER IS IN DATABASE WITH ID & PASSES IT TO THE NEXT MIDDLEWARE ] ============ //
// ========================================================================================= //

type RequestWithUserIdInParams = Request<{ userId: string }, {}, {}>;

export async function checkUserExistsWithId(
  request: RequestWithUserIdInParams,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });
    (
      request as Types.RequestWithFoundUser & RequestWithUserIdInParams
    ).foundUser = user;
    return next();
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: `Account does not exist. Please register to create a new account.`,
    });
  }
}

// ========================================================================================= //
// [ CHECKS IF USERNAME IS IN DATABASE & PASSES IT TO THE NEXT MIDDLEWARE ] ================ //
// ========================================================================================= //

export async function checkUserExistsOnLoginAttempt(
  request: Types.LoginUserRequest,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });
    (request as Types.LoginUserRequest & Types.RequestWithFoundUser).foundUser =
      user;
    return next();
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: `Account does not exist. Please register to create a new account.`,
    });
  }
}

// ========================================================================================= //
// [ CHECKS IF USER HAS VERIFIED THEIR ACCOUNT ] =========================================== //
// ========================================================================================= //

export async function checkUserVerifiedOnLoginAttempt(
  request: RequestWithUserIdInParams,
  response: Response,
  next: NextFunction
) {
  const { foundUser } = request as RequestWithUserIdInParams &
    Types.RequestWithFoundUser;

  if (foundUser.emailVerified) {
    return next();
  } else {
    return HttpHelpers.respondWithClientError(response, "unauthorized", {
      body: "Account is still pending email verification. Please check your email and verify your registration. If your verification code has expired, please request a new one and try again.",
    });
  }
}

// ========================================================================================= //
// [ CHECKS IF USER IS ALREADY LOGGED OUT ] ================================================ //
// ========================================================================================= //

export async function checkUserAlreadyLoggedOut(
  request: Request<{ userId: string }>,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });
    if (user.loggedIn === false) {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: "Account already logged out.",
      });
    } else {
      return next();
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

// ========================================================================================= //
// [ VERIFIES JWT ACCESS TOKEN ] =========================================================== //
// ========================================================================================= //

// ↓↓↓ Middleware that authenticates user actions via a JWT access token. ↓↓↓ //
// ↓↓↓ Checks if there is a valid access token (e.g. it exists or supplies the correct secret key). ↓↓↓ //
// ↓↓↓ If not, user is not authorized to make an action. ↓↓↓ //
//
// ↓↓↓ This middleware is performed before hitting any endpoint that requires validation credentials. ↓↓↓ //
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
        // const accessToken = request
        //   .header("Authorization")
        //   ?.replace("Bearer ", "");

        const accessToken = request.cookies.accessToken;

        if (!accessToken) {
          return HttpHelpers.respondWithClientError(response, "unauthorized", {
            body: "No access token. Either the token has expired or there was an error in locating it. Please try again.",
          });
        } else {
          const decodedAccessToken = jwt.verify(accessToken, authSecretKey);
          // ↓↓↓ Appending our decoded access token to Express's `request` object for use. ↓↓↓ //
          // ↓↓↓ in the action the user wanted to perform. ↓↓↓ //
          (request as RequestWithAccessToken).accessToken = decodedAccessToken;
          return next();
        }
      }
    );
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "unauthorized", {
      body: "Unauthorized access.",
    });
  }
}
