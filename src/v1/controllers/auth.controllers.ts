import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

import * as Helpers from "../helpers/auth.helpers";
import * as UserTypes from "../types/users.types";
import { RequestWithUser, UserRegistrationData } from "../types/auth.types";
import {
  confirmationCodeSuccessData,
  excludeFieldFromUserObject,
} from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";
import { DetailedMessage } from "../types/general.types";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ REGISTRATION : CREATES A NEW ACCOUNT ] ================================================ //
// ========================================================================================= //

export async function registerUser(request: Request, response: Response) {
  try {
    const confirmationCodeSecretKey = Helpers.handleJWTSecretKeyFetch(response);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    const confirmationCode = Helpers.generateEmailConfirmationCode(
      confirmationCodeSecretKey as string
    );

    const userRegistrationData: UserRegistrationData = {
      email: request.body.email,
      username: request.body.username,
      password: hashedPassword,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      birthday: request.body.birthday,
      currency: request.body.currency,
      confirmationCode,
    };

    const user: UserTypes.UserWithRelations = await prisma.user.create({
      data: userRegistrationData,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });

    const { code } = jwt.verify(
      confirmationCode,
      confirmationCodeSecretKey as string
    ) as { code: string } & JwtPayload;

    Helpers.sendUserConfirmationEmail(
      request.body.email,
      "Kujira Test Email Confirmation",
      "Thank you for registering with Kujira. We're glad to have you on board :)",
      code
    );

    const userWithoutPassword = excludeFieldFromUserObject(user, ["password"]);
    return response.status(HttpStatusCodes.CREATED).json({
      user: userWithoutPassword,
      success: {
        title:
          "Thank you for registering with Kujira. We're happy to have you on board!",
        body: "We've sent a confirmation code to your email. Please enter it below to gain access to the app.",
        footnote:
          "Please note that we will automatically terminate your account if it hasn't been verified within 7 days.",
      } as DetailedMessage,
    });
  } catch (error) {
    // ↓↓↓ The client should verify uniqueness of email and username before hitting this endpoint. ↓↓↓
    // ↓↓↓ If it, for whatever reason, does not verify first, we hit this back-up `catch` block. ↓↓↓
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to create account. You might have entered a non-unique email or username. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ REGISTRATION : VERIFIES USER ACCOUNT WITH SUPPLIED CONFIRMATION CODE ] ================ //
// ========================================================================================= //

export async function finalizeRegistrationWithConfirmationCode(
  request: Request,
  response: Response
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    if (user.confirmationCode) {
      const confirmationCodeSecretKey =
        Helpers.handleJWTSecretKeyFetch(response);
      const { code } = jwt.verify(
        user.confirmationCode as string,
        confirmationCodeSecretKey as string
      ) as { code: string } & JwtPayload;

      if (user.accountStatus === "VERIFIED") {
        return response
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ error: "Account already verified." });
      } else if (request.params.confirmationCode === code) {
        await prisma.user.update({
          where: { id: user.id },
          data: confirmationCodeSuccessData,
        });
        return response.status(HttpStatusCodes.OK).json({
          success: "Account verification successful!",
        });
      } else {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({
          error:
            "You've supplied an incorrect confirmation code. Please enter the correct code and try again.",
        });
      }
    } else {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Account does not have a confirmation code. Please register again.",
      });
    }
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "Account not found. Please try again.",
    });
  }
}

// ========================================================================================= //
// [ REGISTRATION : ALLOWS CLIENT TO CHECK IF EMAIL ALREADY EXISTS IN DATABASE ] =========== //
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
// [ REGISTRATION : ALLOWS CLIENT TO CHECK IF USERNAME ALREADY EXISTS IN DATABASE ] ======== //
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
// [ LOGIN : CONFIRMS PASSWORD LOGIN & EMAILS NEW CONFIRMATION CODE ] ====================== //
// ========================================================================================= //

export async function initializeLoginWithUsernameAndPassword(
  request: Request,
  response: Response
) {
  try {
    const accessTokenSecretKey = Helpers.handleJWTSecretKeyFetch(response);

    const passwordsMatch = bcrypt.compareSync(
      request.body.password,
      (request as RequestWithUser).existingUser.password
    );

    if (passwordsMatch) {
      const confirmationCode = Helpers.generateEmailConfirmationCode(
        accessTokenSecretKey as string
      );
      await prisma.user.update({
        where: { id: (request as RequestWithUser).existingUser.id },
        data: { accountStatus: "PENDING", confirmationCode },
      });

      const { code } = jwt.verify(
        confirmationCode,
        accessTokenSecretKey as string
      ) as { code: string } & JwtPayload;

      Helpers.sendUserConfirmationEmail(
        (request as RequestWithUser).existingUser.email,
        "Kujira Login",
        "This email is in response to your login request.",
        code
      );

      return response
        .status(HttpStatusCodes.OK)
        .json({ success: "Please check your email for a confirmation code." });
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

// ========================================================================================= //
// [ LOGIN : CONFIRMS LOGIN WITH CONFIRMATION CODE & PROVIDES CLIENT WITH JWT ] ============ //
// ========================================================================================= //

export async function finalizeLoginWithConfirmationCode(
  request: Request,
  response: Response
) {
  try {
    const accessTokenSecretKey = Helpers.handleJWTSecretKeyFetch(response);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    if (user.confirmationCode) {
      const { code } = jwt.verify(
        user.confirmationCode as string,
        accessTokenSecretKey as string
      ) as { code: string } & JwtPayload;
      // If the user supplied the correct confirmation code saved in the database.
      if (request.params.confirmationCode === code) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: confirmationCodeSuccessData,
        });
        const accessToken = jwt.sign(
          { _id: user.id.toString(), username: user.username },
          accessTokenSecretKey as string,
          { expiresIn: request.body.thirtyDays ? "30 days" : "7 days" }
        );
        const userWithoutPassword = excludeFieldFromUserObject(updatedUser, [
          "password",
        ]);
        return response.status(HttpStatusCodes.OK).json({
          user: userWithoutPassword,
          accessToken,
          success: "Account verification successful!",
        });
      }
      // If the user supplied an incorrect confirmation code.
      else {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({
          error:
            "You've supplied an incorrect confirmation code. Please enter the correct code and try again.",
        });
      }
    } else {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Account does not have a confirmation code. Please try logging in again.",
      });
    }
  } catch (error) {
    return response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Account not found. Please try again." });
  }
}

// ========================================================================================= //
// [ MAKING A NEW CONFIRMATION CODE FOR WHEN THE OLD ONE EXPIRES ] ========================= //
// ========================================================================================= //

export async function regenerateEmailConfirmationCode(
  request: Request,
  response: Response
) {
  try {
    const confirmationCodeSecretKey = Helpers.handleJWTSecretKeyFetch(response);
    const newConfirmationCode = Helpers.generateEmailConfirmationCode(
      confirmationCodeSecretKey as string
    );
    const user = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: {
        accountStatus: "PENDING",
        confirmationCode: newConfirmationCode,
      },
    });

    const { code } = jwt.verify(
      newConfirmationCode,
      confirmationCodeSecretKey as string
    ) as { code: string } & JwtPayload;

    Helpers.sendUserConfirmationEmail(
      user.email,
      "Your New Confirmation Code",
      "We've received a request for a new confirmation code.",
      code
    );

    return response.status(HttpStatusCodes.OK).json({
      success: "New confirmation code sent! Please check your email.",
    });
  } catch (error) {
    return response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Account not found. Please try again." });
  }
}
