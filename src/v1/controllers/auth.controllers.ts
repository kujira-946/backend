import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as Helpers from "../helpers/auth.helpers";
import { RequestWithUser, UserRegistrationData } from "../types/auth.types";
import { UserWithRelations } from "../types/users.types";
import { DetailedMessage } from "../types/general.types";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";
import { AuthErrors, AuthSuccesses } from "../utils/auth.utils";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF EMAIL IS ALREADY IN DATABASE ] ============================================== //
// ========================================================================================= //

export async function checkEmailAvailability(
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
// [ CHECKS IF USERNAME IS ALREADY IN DATABASE ] =========================================== //
// ========================================================================================= //

export async function checkUsernameAvailability(
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
// [ ADDS NEW USER TO DATABASE & EMAILS THEM A VERIFICATION CODE ] ========================= //
// ========================================================================================= //

// ↓↓↓ Adds new user to database and returns new user object. ↓↓↓
async function _addUserToDatabase(request: Request, verificationCode: string) {
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
    verificationCode,
  };
  const newUser = await prisma.user.create({ data: userRegistrationData });
  return newUser;
}
// ↓↓↓ Emailing user a code to verify the authenticity of their account. ↓↓↓
async function _emailVerificationCodeToNewUser(
  request: Request,
  verificationCode: string,
  verificationSecretKey: string
) {
  const extractedCode = Helpers.extractVerificationCode(
    verificationCode,
    verificationSecretKey
  );
  Helpers.emailUser(
    request.body.email,
    "Thank you for registering with Kujira.",
    [
      "We're glad to have you on board :)",
      `Please copy and paste the following verification code into the app to verify your registration: ${extractedCode}`,
    ]
  );
}

export async function registerUser(
  request: Request<{}, {}, UserRegistrationData>,
  response: Response
) {
  try {
    const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
    if (!verificationSecretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const verificationCode = Helpers.generateVerificationCode(
        verificationSecretKey
      );
      const newUser = await _addUserToDatabase(request, verificationCode);
      _emailVerificationCodeToNewUser(
        request,
        verificationCode,
        verificationSecretKey
      );
      // ↓↓↓ Only need `userId` here for the client to hit proper endpoint to verify the correct account. ↓↓↓
      return response.status(HttpStatusCodes.CREATED).json({
        userId: newUser.id,
        success: {
          title:
            "Thank you for registering with Kujira. We're glad to have you on board!",
          body: "We've sent a verification code to your email. Please enter it below to gain access to the app.",
          footnote:
            "Please note that we will automatically terminate your account if it hasn't been verified within 7 days.",
        } as DetailedMessage,
      });
    }
  } catch (error) {
    // ↓↓↓ The client should verify uniqueness of email and username before hitting this endpoint. ↓↓↓
    // ↓↓↓ Backup error handling in case it doesn't. ↓↓↓
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to create account. You may have entered a non-unique email or username. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ VERIFIES REGISTRATION WITH VERIFICATION CODE ] ======================================== //
// ========================================================================================= //

// ↓↓↓ Checking database verification code against the one supplied by the user through the client. ↓↓↓
async function _handleRegistrationVerification(
  request: Request,
  response: Response,
  verificationCode: string,
  verificationSecretKey: string,
  userId: number
) {
  const userVerificationCode = Helpers.extractVerificationCode(
    verificationCode,
    verificationSecretKey
  );
  if (request.params.verificationCode === userVerificationCode) {
    const updatedUser: UserWithRelations = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, verificationCode: null },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json({
      user: userWithoutPassword,
      success: AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
    });
  } else {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: AuthErrors.INCORRECT_VERIFICATION_CODE,
    });
  }
}

export async function verifyRegistration(request: Request, response: Response) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    switch (user.emailVerified) {
      case true:
        return response
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ error: "Account already verified. Please log in." });

      default:
        const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;

        if (!verificationSecretKey) {
          return Helpers.returnServerErrorOnUndefinedSecretKey(response);
        } else {
          if (user.verificationCode) {
            const verificationCodeExpired = Helpers.checkJWTExpired(
              user.verificationCode,
              verificationSecretKey
            );

            if (verificationCodeExpired) {
              return response.status(HttpStatusCodes.BAD_REQUEST).json({
                error: AuthErrors.VERIFICATION_CODE_EXPIRED,
              });
            } else {
              return _handleRegistrationVerification(
                request,
                response,
                user.verificationCode,
                verificationSecretKey,
                user.id
              );
            }
          } else {
            return response.status(HttpStatusCodes.BAD_REQUEST).json({
              error: AuthErrors.ACCOUNT_HAS_NO_VERIFICATION_CODE,
            });
          }
        }
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

// ========================================================================================= //
// [ VERIFIES USERNAME/PASSWORD ON LOGIN & EMAILS CODE TO VERIFY LOGIN ATTEMPT ] =========== //
// ========================================================================================= //

async function _assignNewVerificationCodeToUser(
  request: Request,
  verificationCode: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: (request as RequestWithUser).existingUser.id },
    data: { loggedIn: false, verificationCode },
  });
  return updatedUser.id;
}
function _emailNewVerificationCodeToUser(
  request: Request,
  verificationCode: string,
  verificationSecretKey: string
) {
  const extractedCode = Helpers.extractVerificationCode(
    verificationCode,
    verificationSecretKey
  );
  Helpers.emailUser(
    (request as RequestWithUser).existingUser.email,
    "Kujira Login",
    [
      "Welcome back! This email is in response to your login request.",
      `Please copy and paste the following verification code into the app to verify your login: ${extractedCode}`,
    ]
  );
}

export async function loginUser(request: Request, response: Response) {
  try {
    const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
    if (!verificationSecretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const passwordsMatch = bcrypt.compareSync(
        request.body.password,
        (request as RequestWithUser).existingUser.password
      );
      if (passwordsMatch) {
        const verificationCode = Helpers.generateVerificationCode(
          verificationSecretKey
        );
        const userId = await _assignNewVerificationCodeToUser(
          request,
          verificationCode
        );
        _emailNewVerificationCodeToUser(
          request,
          verificationCode,
          verificationSecretKey
        );
        return response.status(HttpStatusCodes.OK).json({
          userId,
          success: "Please check your email for a verification code.",
        });
      } else {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({
          error: "Incorrect password. Please try again.",
        });
      }
    }
  } catch (error) {
    // ↓↓↓ Backup error handling in case previous middlewares don't work as intended. ↓↓↓
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to log in. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}

// ========================================================================================= //
// [ VERIFIES LOGIN WITH VERIFICATION CODE & PROVIDES CLIENT WITH JWT ON SUCCESS ] ========= //
// ========================================================================================= //

// ↓↓↓ If the user supplied the correct verification code saved into their account. ↓↓↓
async function _handleLoginVerification(
  request: Request,
  response: Response,
  verificationCode: string,
  verificationSecretKey: string,
  authSecretKey: string,
  userId: number
) {
  const extractedCode = Helpers.extractVerificationCode(
    verificationCode,
    verificationSecretKey
  );
  if (request.params.verificationCode === extractedCode) {
    const updatedUser: UserWithRelations = await prisma.user.update({
      where: { id: userId },
      data: { loggedIn: true, verificationCode: null },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const accessToken = jwt.sign({ _id: userId.toString() }, authSecretKey, {
      expiresIn: request.body.thirtyDays ? "30 days" : "7 days",
    });
    const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json({
      user: userWithoutPassword,
      accessToken,
      success: AuthSuccesses.ACCOUNT_VERIFICATION_SUCCESS,
    });
  } else {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: AuthErrors.INCORRECT_VERIFICATION_CODE,
    });
  }
}

export async function verifyLogin(request: Request, response: Response) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
    const authSecretKey = process.env.AUTH_SECRET_KEY;

    if (!verificationSecretKey || !authSecretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      if (user.verificationCode) {
        const verificationCodeExpired = Helpers.checkJWTExpired(
          user.verificationCode,
          verificationSecretKey
        );
        
        if (verificationCodeExpired) {
          return response.status(HttpStatusCodes.BAD_REQUEST).json({
            error: AuthErrors.VERIFICATION_CODE_EXPIRED,
          });
        } else {
          return _handleLoginVerification(
            request,
            response,
            user.verificationCode,
            verificationSecretKey,
            authSecretKey,
            user.id
          );
        }
      } else {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({
          error: AuthErrors.ACCOUNT_HAS_NO_VERIFICATION_CODE,
        });
      }
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

// ========================================================================================= //
// [ LOG OUT ] ============================================================================= //
// ========================================================================================= //

export async function logout(request: Request, response: Response) {
  try {
    await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: { loggedIn: false, verificationCode: null },
    });
    return response
      .status(HttpStatusCodes.OK)
      .json({ success: "Log out successful." });
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: AuthErrors.ACCOUNT_NOT_FOUND,
    });
  }
}

// ========================================================================================= //
// [ EMAILING USER A NEW VERIFICATION CODE ] =============================================== //
// ========================================================================================= //

export async function requestNewVerificationCode(
  request: Request<{ email: string }>,
  response: Response
) {
  try {
    const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
    if (!verificationSecretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const newVerificationCode = Helpers.generateVerificationCode(
        verificationSecretKey
      );
      const user = await prisma.user.update({
        where: { email: request.params.email },
        data: {
          loggedIn: false,
          verificationCode: newVerificationCode,
        },
      });

      const newCode = Helpers.extractVerificationCode(
        newVerificationCode,
        verificationSecretKey
      );
      Helpers.emailUser(user.email, "Your New Verification Code", [
        "We've received your request for a new verification code.",
        `Please copy and paste the following verification code into the app to verify your account: ${newCode}`,
      ]);

      return response.status(HttpStatusCodes.OK).json({
        success: "New verification code sent! Please check your email.",
      });
    }
  } catch (error) {
    return response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: AuthErrors.ACCOUNT_NOT_FOUND });
  }
}
