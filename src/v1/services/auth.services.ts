import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Helpers from "../helpers/auth.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import * as Utils from "../utils/auth.utils";
import * as Validators from "../validators/auth.validators";
import { OverviewCreateValidator } from "./../validators/overviews.validators";
import { generateSafeUser } from "../helpers/users.helpers";

const prisma = new PrismaClient();

export async function addUserToDatabase(
  request: Request<{}, {}, Validators.RegistrationValidator>,
  response: Response,
  verificationCode: string
) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    const registrationData: Validators.RegistrationValidator = {
      email: request.body.email,
      username: request.body.username.toLowerCase(),
      password: hashedPassword,
      verificationCode,
    };
    const newUser = await prisma.user.create({ data: registrationData });
    return newUser.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: `Provided ${error.meta?.target} not available`,
      });
    } else {
      return HttpHelpers.respondWithServerError(
        response,
        "internal server error",
        {
          body: "There was an error with creating your account. Please try again.",
        }
      );
    }
  }
}

export async function emailVerificationCodeToNewUser(
  userEmail: string,
  signedVerificationCode: string,
  verificationSecretKey: string
) {
  const extractedCode = Helpers.extractVerificationCode(
    signedVerificationCode,
    verificationSecretKey
  );
  Helpers.emailUser(userEmail, "Kujira: Confirm Registration", [
    "Thank you for registering! Glad to have you on board :)",
    `Please copy and paste the following verification code into the app to verify your registration: ${extractedCode}`,
    "If this is a mistake, you can safely ignore this email.",
  ]);
}

async function createNewUserOverview(foundUserId: number) {
  const overviewCreateData: OverviewCreateValidator = {
    income: 0,
    ownerId: foundUserId,
  };
  return await prisma.overview.create({
    data: overviewCreateData,
  });
}

async function _createNewUserRecurringOverviewGroup(overviewId: number) {
  const recurringOverviewGroupData: OverviewGroupCreateValidator = {
    name: "Recurring",
    overviewId: overviewId,
  };
  await prisma.overviewGroup.create({
    data: recurringOverviewGroupData,
  });
}

async function _createNewUserIncomingOverviewGroup(overviewId: number) {
  const incomingOverviewGroupData: OverviewGroupCreateValidator = {
    name: "Incoming",
    overviewId: overviewId,
  };
  await prisma.overviewGroup.create({
    data: incomingOverviewGroupData,
  });
}

export async function registrationVerificationHandler(
  response: Response,
  clientVerificationCode: string,
  databaseVerificationCode: string,
  authSecretKey: string,
  foundUserId: number
) {
  try {
    // ↓↓↓ If the user entered the correct verification code. ↓↓↓ //
    if (clientVerificationCode === databaseVerificationCode) {
      const updatedUser = await prisma.user.update({
        where: { id: foundUserId },
        data: {
          emailVerified: true,
          loggedIn: true,
          verificationCode: null,
        },
      });

      const newUserOverview = await createNewUserOverview(foundUserId);
      await _createNewUserRecurringOverviewGroup(newUserOverview.id);
      await _createNewUserIncomingOverviewGroup(newUserOverview.id);

      const accessToken = jwt.sign(
        { _id: foundUserId.toString() },
        authSecretKey,
        { expiresIn: "30 days" }
      );
      const safeUser = generateSafeUser(updatedUser);

      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: Utils.AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
        data: safeUser,
        accessToken,
      });
    } else {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: Utils.AuthErrors.INCORRECT_VERIFICATION_CODE,
      });
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: Utils.AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

export async function assignNewVerificationCodeToUser(
  foundUserId: number,
  verificationCode: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: foundUserId },
    data: { loggedIn: false, verificationCode },
  });
  return updatedUser.id;
}

export function emailNewVerificationCodeToUser(
  signedVerificationCode: string,
  verificationSecretKey: string,
  foundUserEmail: string
) {
  const verificationCode = Helpers.extractVerificationCode(
    signedVerificationCode,
    verificationSecretKey
  );
  Helpers.emailUser(foundUserEmail, "Kujira Login", [
    "Welcome back! This email is in response to your login request.",
    `Please copy and paste the following verification code into the app to verify your login: ${verificationCode}`,
    "If this is a mistake, you can safely ignore this email.",
  ]);
}

// ↓↓↓ If the user supplied the correct verification code saved into their account. ↓↓↓ //
export async function loginVerificationHandler(
  response: Response,
  clientVerificationCode: string,
  databaseVerificationCode: string,
  authSecretKey: string,
  foundUserId: number,
  thirtyDays: boolean
) {
  if (clientVerificationCode === databaseVerificationCode) {
    const updatedUser = await prisma.user.update({
      where: { id: foundUserId },
      data: { loggedIn: true, verificationCode: null },
    });

    const accessToken = jwt.sign(
      { _id: foundUserId.toString() },
      authSecretKey,
      { expiresIn: thirtyDays ? "30 days" : "7 days" }
    );

    const safeUser = generateSafeUser(updatedUser);
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: Utils.AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
      data: safeUser,
      accessToken,
    });
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: Utils.AuthErrors.INCORRECT_VERIFICATION_CODE,
    });
  }
}
