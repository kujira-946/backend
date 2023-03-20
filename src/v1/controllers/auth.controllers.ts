import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as Types from "../types/auth.types";
import * as Validators from "../validators/auth.validators";
import * as Utils from "../utils/auth.utils";
import * as Helpers from "../helpers/auth.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import { UserRelationsValidator } from "../validators/users.validators";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF EMAIL IS ALREADY IN DATABASE ] ============================================== //
// ========================================================================================= //

export async function checkEmailAvailability(
  request: Request<{}, {}, { email: string }>,
  response: Response
) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "An account with that email already exists. Please try again.",
    });
  } catch (error) {
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Email available.",
    });
  }
}

// ========================================================================================= //
// [ CHECKS IF USERNAME IS ALREADY IN DATABASE ] =========================================== //
// ========================================================================================= //

export async function checkUsernameAvailability(
  request: Request<{}, {}, { username: string }>,
  response: Response
) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { username: request.body.username },
    });
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "An account wth that username already exists. Please try again.",
    });
  } catch (error) {
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Username available.",
    });
  }
}

// ========================================================================================= //
// [ ADDS NEW USER TO DATABASE & EMAILS THEM A VERIFICATION CODE ] ========================= //
// ========================================================================================= //

// ↓↓↓ Adds new user to database and returns new user object. ↓↓↓ //
async function _addUserToDatabase(
  request: Request<{}, {}, Validators.UserRegistrationValidator>,
  signedVerificationCode: string
) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  const UserRegistrationValidator: Validators.UserRegistrationValidator = {
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
  const newUser = await prisma.user.create({ data: UserRegistrationValidator });
  return newUser;
}

// ↓↓↓ Emailing user a code to verify the authenticity of their account. ↓↓↓ //
async function _emailVerificationCodeToNewUser(
  request: Request,
  signedVerificationCode: string,
  verificationSecretKey: string
) {
  const extractedCode = Helpers.extractVerificationCode(
    signedVerificationCode,
    verificationSecretKey
  );
  Helpers.emailUser(request.body.email, "Kujira: Confirm Registration", [
    "Thank you for registering! Glad to have you on board :)",
    `Please copy and paste the following verification code into the app to verify your registration: ${extractedCode}`,
  ]);
}

export async function registerUser(
  request: Request<{}, {}, Validators.UserRegistrationValidator>,
  response: Response
) {
  return Helpers.handleSecretKeysExist(
    response,
    async function (verificationSecretKey: string) {
      try {
        const signedVerificationCode = Helpers.generateSignedVerificationCode(
          verificationSecretKey
        );
        const newUser = await _addUserToDatabase(
          request,
          signedVerificationCode
        );
        _emailVerificationCodeToNewUser(
          request,
          signedVerificationCode,
          verificationSecretKey
        );
        // ↓↓↓ Only need `userId` here for the client to hit proper endpoint to verify the correct account. ↓↓↓ //
        return HttpHelpers.respondWithSuccess(response, "created", {
          title:
            "Thank you for registering with Kujira. Glad to have you on board!",
          body: "A verification code was sent to your email. Please enter it below to gain access to the app.",
          footnote:
            "Please note that your verification code will expire within 5 minutes.",
          data: newUser.id,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: `${error.meta?.target} not available.`,
          });
        } else {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: "Failed to create account. You may have entered a non-unique email or username. Please try again.",
          });
        }
      }
    }
  );
}

// ========================================================================================= //
// [ VERIFIES REGISTRATION WITH VERIFICATION CODE ] ======================================== //
// ========================================================================================= //

async function _registrationVerificationHandler(
  response: Response,
  clientVerificationCode: string,
  databaseVerificationCode: string,
  foundUserId: number
) {
  try {
    // ↓↓↓ If the user entered the correct verification code. ↓↓↓ //
    if (clientVerificationCode === databaseVerificationCode) {
      const updatedUser: UserRelationsValidator = await prisma.user.update({
        where: { id: foundUserId },
        data: { emailVerified: true, signedVerificationCode: null },
        include: {
          overview: { include: { groups: true } },
          logbooks: { include: { entries: { include: { purchases: true } } } },
        },
      });
      const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
        "password",
      ]);
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: Utils.AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
        data: userWithoutPassword,
      });
    }
    // ↓↓↓ If the user entered an incorrect verification code. ↓↓↓ //
    else {
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

type RegistrationVerificationRequest = Request<
  { userId: string },
  {},
  { verificationCode: string }
>;

export function verifyRegistration(
  request: RegistrationVerificationRequest,
  response: Response
) {
  // ↓↓↓ Passed from `checkUsernameExists` middleware. Check `/register/:userId/verify` route. ↓↓↓ //
  const { foundUser } = request as RegistrationVerificationRequest &
    Types.RequestWithFoundUser;

  if (foundUser.emailVerified) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Account already verified. Please log in.",
    });
  } else {
    return Helpers.handleAccountVerification(
      response,
      foundUser,
      function (verificationCode: string) {
        return _registrationVerificationHandler(
          response,
          request.body.verificationCode,
          verificationCode,
          foundUser.id
        );
      }
    );
  }
}

// ========================================================================================= //
// [ VERIFIES USERNAME/PASSWORD ON LOGIN & EMAILS CODE TO VERIFY LOGIN ATTEMPT ] =========== //
// ========================================================================================= //

async function _assignNewVerificationCodeToUser(
  foundUserId: number,
  signedVerificationCode: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: foundUserId },
    data: { loggedIn: false, signedVerificationCode },
  });
  return updatedUser.id;
}

function _emailNewVerificationCodeToUser(
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
  ]);
}

export async function loginUser(
  request: Types.LoginUserRequest,
  response: Response
) {
  return Helpers.handleSecretKeysExist(
    response,
    async function (verificationSecretKey: string) {
      // ↓↓↓ Passed from `checkUsernameExists` middleware. Check `/login` route. ↓↓↓ //
      const { foundUser } = request as Types.LoginUserRequest &
        Types.RequestWithFoundUser;

      const passwordsMatch = bcrypt.compareSync(
        request.body.password,
        foundUser.password
      );

      if (passwordsMatch) {
        const signedVerificationCode = Helpers.generateSignedVerificationCode(
          verificationSecretKey
        );
        const userId = await _assignNewVerificationCodeToUser(
          foundUser.id,
          signedVerificationCode
        );
        _emailNewVerificationCodeToUser(
          signedVerificationCode,
          verificationSecretKey,
          foundUser.email
        );
        return HttpHelpers.respondWithSuccess(response, "ok", {
          body: "Please check your email for a verification code.",
          footnote:
            "Please note that your verification code will expire within 5 minutes.",
          data: userId,
        });
      } else {
        return HttpHelpers.respondWithClientError(response, "bad request", {
          body: "Incorrect password. Please try again.",
        });
      }
    }
  );
}

// ========================================================================================= //
// [ VERIFIES LOGIN WITH VERIFICATION CODE & PROVIDES CLIENT WITH JWT ON SUCCESS ] ========= //
// ========================================================================================= //

// ↓↓↓ If the user supplied the correct verification code saved into their account. ↓↓↓ //
async function _loginVerificationHandler(
  response: Response,
  clientVerificationCode: string,
  databaseVerificationCode: string,
  authSecretKey: string,
  foundUserId: number,
  thirtyDays: boolean
) {
  if (clientVerificationCode === databaseVerificationCode) {
    const updatedUser: UserRelationsValidator = await prisma.user.update({
      where: { id: foundUserId },
      data: { loggedIn: true, signedVerificationCode: null },
      include: {
        overview: { include: { groups: true } },
        logbooks: { include: { entries: { include: { purchases: true } } } },
      },
    });
    const accessToken = jwt.sign(
      { _id: foundUserId.toString() },
      authSecretKey,
      { expiresIn: thirtyDays ? "30 days" : "7 days" }
    );
    const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
      "password",
    ]);
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: Utils.AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
      data: userWithoutPassword,
      accessToken,
    });
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: Utils.AuthErrors.INCORRECT_VERIFICATION_CODE,
    });
  }
}

type LoginVerificationRequest = Request<
  { userId: string },
  {},
  { verificationCode: string; thirtyDays: boolean }
>;
export async function verifyLogin(
  request: LoginVerificationRequest,
  response: Response
) {
  // ↓↓↓ Passed from `checkUsernameExists` middleware. Check `/login/:userId/verify` route. ↓↓↓ //
  const { foundUser } = request as LoginVerificationRequest &
    Types.RequestWithFoundUser;

  if (!foundUser.emailVerified) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Account pending verification. Please check your email for a verification code or request a new one.",
    });
  } else {
    return Helpers.handleAccountVerification(
      response,
      foundUser,
      function (verificationCode: string, authSecretKey: string) {
        return _loginVerificationHandler(
          response,
          request.body.verificationCode,
          verificationCode,
          authSecretKey,
          foundUser.id,
          request.body.thirtyDays
        );
      }
    );
  }
}

// ========================================================================================= //
// [ LOG OUT ] ============================================================================= //
// ========================================================================================= //

export async function logout(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: { loggedIn: false, signedVerificationCode: null },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Log out successful.",
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: Utils.AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

// ========================================================================================= //
// [ EMAILING USER A NEW VERIFICATION CODE ] =============================================== //
// ========================================================================================= //

export async function requestNewVerificationCode(
  request: Request<{ userId: string }>,
  response: Response
) {
  return Helpers.handleSecretKeysExist(
    response,
    async function (verificationSecretKey: string) {
      try {
        const signedVerificationCode = Helpers.generateSignedVerificationCode(
          verificationSecretKey
        );

        const user = await prisma.user.update({
          where: { id: Number(request.params.userId) },
          data: { loggedIn: false, signedVerificationCode },
        });

        const verificationCode = Helpers.extractVerificationCode(
          signedVerificationCode,
          verificationSecretKey
        );
        Helpers.emailUser(user.email, "Kujira: New Verification Code", [
          "This email is in response to your request for a new verification code.",
          `Please copy and paste the following verification code into the app to verify your account: ${verificationCode}`,
        ]);

        return HttpHelpers.respondWithSuccess(response, "ok", {
          body: "New verification code sent! Please check your email.",
        });
      } catch (error) {
        return HttpHelpers.respondWithClientError(response, "bad request", {
          body: Utils.AuthErrors.ACCOUNT_NOT_FOUND,
        });
      }
    }
  );
}
