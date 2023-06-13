import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/auth.validators";
import * as Utils from "../utils/auth.utils";
import * as Helpers from "../helpers/auth.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import { OverviewCreateValidator } from "./../validators/overviews.validators";
import { OverviewGroupCreateValidator } from "./../validators/overview-groups.validators";
import { generateSafeUser } from "../helpers/users.helpers";

const prisma = new PrismaClient();

export async function addUserToDatabase(
  request: Request<{}, {}, Validators.RegistrationValidator>,
  signedVerificationCode: string
) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  const RegistrationValidator: Validators.RegistrationValidator = {
    email: request.body.email,
    username: request.body.username.toLowerCase(),
    password: hashedPassword,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    birthday: request.body.birthday,
    currency: request.body.currency,
    mobileNumber: request.body.mobileNumber,
    signedVerificationCode,
  };
  const newUser = await prisma.user.create({ data: RegistrationValidator });
  return newUser.id;
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
          signedVerificationCode: null,
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
  signedVerificationCode: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: foundUserId },
    data: { loggedIn: false, signedVerificationCode },
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
      data: { loggedIn: true, signedVerificationCode: null },
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
