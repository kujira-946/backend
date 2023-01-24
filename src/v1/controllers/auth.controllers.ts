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

const prisma = new PrismaClient();

// ========================================================================================= //
// [ ADDS NEW USER TO DATABASE & EMAILS THEM A VERIFICATION CODE ] ========================= //
// ========================================================================================= //

export async function registerUser(request: Request, response: Response) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      // ↓↓↓ Adding new user to database. ↓↓↓
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        request.body.password,
        saltRounds
      );
      const verificationCode = Helpers.generateVerificationCode(secretKey);
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
      const user = await prisma.user.create({ data: userRegistrationData });

      // ↓↓↓ Emailing user a code to verify the authenticity of their account. ↓↓↓
      const code = Helpers.extractVerificationCode(verificationCode, secretKey);
      Helpers.emailUser(
        request.body.email,
        "Thank you for registering with Kujira.",
        [
          "We're glad to have you on board :)",
          `Please copy and paste the following verification code into the app to verify your registration: ${code}`,
        ]
      );

      // ↓↓↓ Response ↓↓↓
      // ↓↓↓ Note : Only sending `userId` here for registration verification purposes. ↓↓↓
      // ↓↓↓ The user's `user` object with the rest of the necessary fields will be sent after successfully verifying registration. ↓↓↓
      return response.status(HttpStatusCodes.CREATED).json({
        userId: user.id,
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
    // ↓↓↓ If it, for whatever reason, does not verify first, we hit this back-up `catch` block. ↓↓↓
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to create account. You may have entered a non-unique email or username. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ VERIFIES REGISTRATION WITH VERIFICATION CODE ] ======================================== //
// ========================================================================================= //

export async function verifyRegistration(request: Request, response: Response) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    if (user.verificationCode) {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        return Helpers.returnServerErrorOnUndefinedSecretKey(response);
      } else {
        const userVerificationCode = Helpers.extractVerificationCode(
          user.verificationCode,
          secretKey
        );
        if (user.emailVerified) {
          return response
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: "Account already verified. Please log in." });
        } else if (request.params.verificationCode === userVerificationCode) {
          const updatedUser: UserWithRelations = await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: true,
              loggedIn: true,
              verificationCode: null,
            },
            include: { overview: true, logbooks: true, logbookReviews: true },
          });
          const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
            "password",
          ]);
          return response.status(HttpStatusCodes.OK).json({
            user: userWithoutPassword,
            success: "Account successfully verified!",
          });
        } else {
          return response.status(HttpStatusCodes.BAD_REQUEST).json({
            error:
              "You've supplied an incorrect verification code. Please enter the correct code and try again.",
          });
        }
      }
    } else {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Account does not have a verification code. Either log in or try registering again.",
      });
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "Account not found. Please try again.",
    });
  }
}

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
// [ VERIFIES USERNAME/PASSWORD ON LOGIN & EMAILS CODE TO VERIFY LOGIN ATTEMPT ] =========== //
// ========================================================================================= //

export async function loginUser(request: Request, response: Response) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const passwordsMatch = bcrypt.compareSync(
        request.body.password,
        (request as RequestWithUser).existingUser.password
      );

      if (passwordsMatch) {
        // ↓↓↓ Generating user verification code. ↓↓↓
        const verificationCode = Helpers.generateVerificationCode(secretKey);
        const updatedUser = await prisma.user.update({
          where: { id: (request as RequestWithUser).existingUser.id },
          data: { loggedIn: false, verificationCode },
        });

        // ↓↓↓ Emailing user a code to verify the authenticity of their login attempt. ↓↓↓
        const code = Helpers.extractVerificationCode(
          verificationCode,
          secretKey
        );
        Helpers.emailUser(
          (request as RequestWithUser).existingUser.email,
          "Kujira Login",
          [
            "Welcome back! This email is in response to your login request.",
            `Please copy and paste the following verification code into the app to verify your login: ${code}`,
          ]
        );

        // ↓↓↓ Response ↓↓↓
        return response.status(HttpStatusCodes.OK).json({
          userId: updatedUser.id,
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

export async function verifyLogin(request: Request, response: Response) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: Number(request.params.userId) },
      });

      if (user.verificationCode) {
        const code = Helpers.extractVerificationCode(
          user.verificationCode,
          secretKey
        );

        // ↓↓↓ If the user supplied the correct verification code saved into their account. ↓↓↓
        if (request.params.verificationCode === code) {
          const updatedUser: UserWithRelations = await prisma.user.update({
            where: { id: user.id },
            data: { loggedIn: true, verificationCode: null },
            include: { overview: true, logbooks: true, logbookReviews: true },
          });
          const accessToken = jwt.sign({ _id: user.id.toString() }, secretKey, {
            expiresIn: request.body.thirtyDays ? "30 days" : "7 days",
          });
          const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
            "password",
          ]);
          return response.status(HttpStatusCodes.OK).json({
            user: userWithoutPassword,
            accessToken,
            success: "Account verification successful!",
          });
        }
        // ↓↓↓ If the user supplied an incorrect verification code. ↓↓↓
        else {
          return response.status(HttpStatusCodes.BAD_REQUEST).json({
            error:
              "You've supplied an incorrect verification code. Please enter the correct code and try again or request a new code.",
          });
        }
      } else {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({
          error:
            "Account does not have a verification code. Either register or try logging in again.",
        });
      }
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "Account not found. Please register to create a new account.",
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
      error: "Account not found. Please refresh the page and try again.",
    });
  }
}

// ========================================================================================= //
// [ EMAILING USER A NEW VERIFICATION CODE ] =============================================== //
// ========================================================================================= //

export async function requestNewVerificationCode(
  request: Request,
  response: Response
) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return Helpers.returnServerErrorOnUndefinedSecretKey(response);
    } else {
      const newVerificationCode = Helpers.generateVerificationCode(secretKey);
      const user = await prisma.user.update({
        where: { id: Number(request.params.userId) },
        data: {
          loggedIn: false,
          verificationCode: newVerificationCode,
        },
      });

      const newCode = Helpers.extractVerificationCode(
        newVerificationCode,
        secretKey
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
      .json({ error: "Account not found. Please try again." });
  }
}
