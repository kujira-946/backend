import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";
import { User } from "../types/users.types";

const prisma = new PrismaClient();

type RegistrationError = {
  email?: string;
  username?: string;
};
export async function checkEmailAndUsernameDuringRegistration(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const userByEmail = await prisma.user.findFirst({
    where: { email: request.body.email },
  });
  const userByUsername = await prisma.user.findFirst({
    where: { email: request.body.username },
  });
  const error: RegistrationError = {};

  if (userByEmail) {
    error["email"] = "An account with that email already exists.";
  }
  if (userByUsername) {
    error["username"] = "An account with that username already exists.";
  }

  console.log("error:", error);

  if (error["email"] || error["username"]) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({ error });
  } else {
    next();
  }
}

export async function checkEmailDuringRegistration(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email: request.body.email },
  });
  if (user) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "An account with that email already exists. Please try again.",
    });
  } else {
    next();
  }
}

export async function checkUsernameDuringRegistration(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { username: request.body.username },
  });
  if (user) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "An account with that username already exists. Please try again.",
    });
  } else {
    next();
  }
}

export type RequestWithUser = { existingUser: User } & Request;
export async function checkUsernameDuringLogin(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  await prisma.user
    .findFirstOrThrow({
      where: { username: request.body.username },
    })
    .then((user: User) => {
      (request as RequestWithUser).existingUser = user;
      next();
    })
    .catch((error: Error) => {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "An account with that username does not exist. Please try again.",
      });
    });
}

// Middleware that authenticates user actions via a JWT access token.
// Checks if there is a valid access token (e.g. it exists or supplies the correct secret key).
// If not, user is not authorized to make an action.
//
// This middleware is performed before hitting any endpoint that requires validation credentials.
type RequestWithAccessToken = { accessToken: string | JwtPayload } & Request;
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
