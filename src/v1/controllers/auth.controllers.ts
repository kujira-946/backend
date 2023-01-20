import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as UserTypes from "../types/users.types";
import { UserRegistrationData } from "../types/auth.types";
import { RequestWithUser } from "../middlewares/auth.middlewares";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";
import { removeLastCharacterFromString } from "../../utils/strings.utils";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ REGISTRATION ] ======================================================================== //
// ========================================================================================= //

type ErrorStrings = { [key in keyof UserRegistrationData]: string };
export async function registrationController(
  request: Request,
  response: Response
): Promise<void> {
  const userRegistrationData: UserRegistrationData = {
    email: request.body.email,
    username: request.body.username,
    password: request.body.password,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    birthday: request.body.birthday,
    currency: request.body.currency,
  };

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    userRegistrationData["password"] = hashedPassword;
    // ↓↓↓ Double checking to make sure the `password` field in the `userRegistrationData` was replaced with the `hashedPassword`. ↓↓↓
    if (userRegistrationData.password !== request.body.password) {
      const user: UserTypes.UserWithRelations = await prisma.user.create({
        data: userRegistrationData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      const userWithoutPassword = excludeFieldFromUserObject(user, [
        "password",
      ]);
      response.status(HttpStatusCodes.CREATED).json(userWithoutPassword);
    }
    // ↓↓↓ If the `password` field in the `userRegistrationData` failed to get replaced with the `hashedPassword`, throw a 500 error. ↓↓↓
    else {
      response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        error:
          "There was an error in creating your account. Please refresh the page and try again.",
      });
    }
  } catch (error) {
    let errorMessage = "Missing fields:";
    const errorStrings: ErrorStrings = {
      email: "Email",
      username: "Username",
      password: "Password",
      firstName: "First Name",
      lastName: "Last name",
      birthday: "Birthday",
      currency: "Currency",
    };
    for (const key in userRegistrationData) {
      const registrationField = request.body[key] as keyof UserRegistrationData;
      if (!registrationField) {
        errorMessage += ` ${errorStrings[key as keyof UserRegistrationData]},`;
      }
    }
    errorMessage = removeLastCharacterFromString(errorMessage) + ".";
    // ↓↓↓ NOTE : The client should first hit the `/register/check-email` and `/register/check-username` endpoints before hitting this one. ↓↓↓
    // ↓↓↓ The `errorMessage` would only ever === "Missing fields." if the user was allowed to send a request to create an account, despite not having created a unique email or username. ↓↓↓
    // ↓↓↓ This `if` block covers sends an error message on the off chance the client decides to be a big dumb and allow the user to send a POST request without first verifying that their email and username are unique via the endpoints mentioned above. ↓↓↓
    if (errorMessage === "Missing fields.") {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to created account. You might have entered a non-unique email or username. Please try again.",
      });
    }
    // ↓↓↓ Sends a detailed error message, telling the user exactly what fields they've failed to fill in. ↓↓↓
    else {
      response
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ error: errorMessage });
    }
  }
}

// ========================================================================================= //
// [ REGISTRATION / CHECK EMAIL ] ========================================================== //
// ========================================================================================= //

export async function registrationCheckEmailController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const userByEmail = await prisma.user.findUnique({
      where: { email: request.body.email },
    });
    if (userByEmail) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "An account with that email already exists. Please try again.",
      });
    } else {
      response.status(HttpStatusCodes.OK).json({ success: "Email available." });
    }
  } catch (error) {
    // ↓↓↓ On the off chance that the client forgets to include the `email` field in the JSON payload. ↓↓↓
    response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: 'Missing "email" field.' });
  }
}

// ========================================================================================= //
// [ REGISTRATION / CHECK USERNAME ] ======================================================= //
// ========================================================================================= //

export async function registrationCheckUsernameController(
  request: Request,
  response: Response
) {
  try {
    const userByUsername = await prisma.user.findUnique({
      where: { username: request.body.username },
    });
    if (userByUsername) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "An account with that username already exists. Please try again.",
      });
    } else {
      response
        .status(HttpStatusCodes.OK)
        .json({ success: "Username available." });
    }
  } catch (error) {
    // ↓↓↓ On the off change that the client forgets to include the `username` field in the JSON payload. ↓↓↓
    response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: 'Missing "username" field.' });
  }
}

// ========================================================================================= //
// [ LOGIN ] =============================================================================== //
// ========================================================================================= //

export async function loginController(request: Request, response: Response) {
  try {
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const passwordsMatch = bcrypt.compareSync(
      request.body.password,
      (request as RequestWithUser).existingUser.password
    );

    if (!accessTokenSecretKey) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
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
      response
        .status(HttpStatusCodes.OK)
        .json({ user: userWithoutPassword, accessToken });
    } else {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Incorrect password. Please try again.",
      });
    }
  } catch (error) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to log in. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}
