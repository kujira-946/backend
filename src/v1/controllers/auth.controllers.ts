import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as UserTypes from "../types/users.types";
import { UserRegistrationData } from "../types/auth.types";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";
import { removeLastCharacterFromString } from "../../utils/strings.utils";

const prisma = new PrismaClient();

type ErrorStrings = { [key in keyof UserRegistrationData]: string };
export async function registrationController(
  request: Request,
  response: Response
) {
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
