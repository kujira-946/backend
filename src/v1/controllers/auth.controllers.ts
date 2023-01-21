import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as UserTypes from "../types/users.types";
import { RequestWithUser, UserRegistrationData } from "../types/auth.types";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ REGISTRATION : CREATING A NEW ACCOUNT ] =============================================== //
// ========================================================================================= //

export async function registrationController(
  request: Request,
  response: Response
) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);

    const userRegistrationData: UserRegistrationData = {
      email: request.body.email,
      username: request.body.username,
      password: hashedPassword,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      birthday: request.body.birthday,
      currency: request.body.currency,
    };

    const user: UserTypes.UserWithRelations = await prisma.user.create({
      data: userRegistrationData,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = excludeFieldFromUserObject(user, ["password"]);
    return response.status(HttpStatusCodes.CREATED).json(userWithoutPassword);
  } catch (error) {
    // ↓↓↓ The client should be making sure that the app never enters this catch block. ↓↓↓
    // ↓↓↓ That is, the client is responsible for using the `/register/check-email` and `/register/check-username` endpoints to make sure that the user has provided a unique email and username BEFORE hitting this controller. ↓↓↓
    // ↓↓↓ On the off chance that the client decides to be a big dumb, this is a fallback error handler that notifies the user of possibly having provided a non-unique email or username. ↓↓↓
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to created account. You might have entered a non-unique email or username. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ REGISTRATION : CHECKING IF CLIENT-PROVIDED EMAIL ALREADY EXISTS IN DATABASE ] ========= //
// ========================================================================================= //

export async function checkRegistrationEmailController(
  request: Request,
  response: Response
) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "An account with that email already exists. Please try again.",
    });
  } catch (error) {
    return response
      .status(HttpStatusCodes.OK)
      .json({ success: "Email available." });
  }
}

// ========================================================================================= //
// [ REGISTRATION : CHECKING IF CLIENT-PROVIDED USERNAME ALREADY EXISTS IN DATABASE ] ====== //
// ========================================================================================= //

export async function checkRegistrationUsernameController(
  request: Request,
  response: Response
) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { username: request.body.username },
    });
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "An account with that username already exists. Please try again.",
    });
  } catch (error) {
    return response
      .status(HttpStatusCodes.OK)
      .json({ success: "Username available." });
  }
}

// ========================================================================================= //
// [ LOGIN : LOGGING IN A USER AND PROVIDING CLIENT WITH A JSON WEB TOKEN ] ================ //
// ========================================================================================= //

export async function loginController(request: Request, response: Response) {
  try {
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const passwordsMatch = bcrypt.compareSync(
      request.body.password,
      (request as RequestWithUser).existingUser.password
    );

    if (!accessTokenSecretKey) {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Something went wrong.",
      });
    } else if (passwordsMatch) {
      const accessToken = jwt.sign(
        {
          _id: (request as RequestWithUser).existingUser.id.toString(),
          username: (request as RequestWithUser).existingUser.username,
        },
        accessTokenSecretKey,
        { expiresIn: request.body.thirtyDays ? "30 days" : "7 days" }
      );
      const userWithoutPassword = excludeFieldFromUserObject(
        (request as RequestWithUser).existingUser,
        ["password"]
      );
      return response
        .status(HttpStatusCodes.OK)
        .json({ user: userWithoutPassword, accessToken });
    } else {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Incorrect password. Please try again.",
      });
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to log in. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}
