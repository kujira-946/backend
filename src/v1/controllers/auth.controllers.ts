import bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/auth.types";
import * as Validators from "../validators/auth.validators";
import * as Services from "../services/auth.services";
import * as Utils from "../utils/auth.utils";
import * as Helpers from "../helpers/auth.helpers";
import * as HttpHelpers from "../helpers/http.helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF EMAIL IS ALREADY IN DATABASE ] ============================================== //
// ========================================================================================= //

export async function checkEmailAvailability(
  request: Request<{}, {}, Validators.EmailAvailabilityValidator>,
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

export async function registerUser(
  request: Request<{}, {}, Validators.RegistrationValidator>,
  response: Response
) {
  return Helpers.handleSecretKeysExist(
    response,
    async function (verificationSecretKey: string) {
      try {
        const signedVerificationCode = Helpers.generateSignedVerificationCode(
          verificationSecretKey
        );

        const newUserId = await Services.addUserToDatabase(
          request,
          signedVerificationCode
        );

        Services.emailVerificationCodeToNewUser(
          request.body.email,
          signedVerificationCode,
          verificationSecretKey
        );

        return HttpHelpers.respondWithSuccess(response, "created", {
          title:
            "Thank you for registering with Kujira. Glad to have you on board!",
          body: "A verification code was sent to your email. Please enter it below to gain access to the app.",
          footnote:
            "Please note that your verification code will expire within 5 minutes.",
          data: newUserId,
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

type VerifyRegistrationRequest = Request<
  {},
  {},
  Validators.VerifyRegistrationValidator
>;
export function verifyRegistration(
  request: VerifyRegistrationRequest,
  response: Response
) {
  // ↓↓↓ Passed from `checkUsernameExists` middleware. Check `/register/:userId/verify` route. ↓↓↓ //
  const { foundUser } = request as VerifyRegistrationRequest &
    Types.RequestWithFoundUser;

  if (foundUser.emailVerified) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Account already verified. Please log in.",
    });
  } else {
    return Helpers.handleAccountVerification(
      response,
      foundUser,
      function (verificationCode: string, authSecretKey: string) {
        if (request.body.signedVerificationCode) {
          return Services.registrationVerificationHandler(
            response,
            request.body.signedVerificationCode,
            verificationCode,
            authSecretKey,
            foundUser.id
          );
        }
      }
    );
  }
}

// ========================================================================================= //
// [ VERIFIES USERNAME/PASSWORD ON LOGIN & EMAILS CODE TO VERIFY LOGIN ATTEMPT ] =========== //
// ========================================================================================= //

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

        const userId = await Services.assignNewVerificationCodeToUser(
          foundUser.id,
          signedVerificationCode
        );

        Services.emailNewVerificationCodeToUser(
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

type LoginVerificationRequest = Request<
  {},
  {},
  Validators.VerifyLoginValidator
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
        if (request.body.signedVerificationCode) {
          return Services.loginVerificationHandler(
            response,
            request.body.signedVerificationCode,
            verificationCode,
            authSecretKey,
            foundUser.id,
            request.body.thirtyDays
          );
        }
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
  request: Request<{}, {}, Validators.RequestNewVerificationCodeValidator>,
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
          where: { email: request.body.email },
          data: { loggedIn: false, signedVerificationCode },
        });

        const verificationCode = Helpers.extractVerificationCode(
          signedVerificationCode,
          verificationSecretKey
        );

        Helpers.emailUser(user.email, "Kujira: New Verification Code", [
          "This email is in response to your request for a new verification code.",
          `Please copy and paste the following verification code into the app to verify your account: ${verificationCode}`,
          "If this is a mistake, you can safely ignore this email.",
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
