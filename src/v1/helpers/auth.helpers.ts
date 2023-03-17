import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Response } from "express";

import * as HttpHelpers from "../helpers/http.helpers";
import { AuthErrors } from "../utils/auth.utils";
import { User } from "@prisma/client";

// ========================================================================================= //
// [ JWT HELPERS ] ========================================================================= //
// ========================================================================================= //

export function handleSecretKeysExist<Callback>(
  response: Response,
  callback: (verificationSecretKey: string, authSecretKey: string) => Callback
) {
  const verificationSecretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
  const authSecretKey = process.env.AUTH_SECRET_KEY;

  if (verificationSecretKey && authSecretKey) {
    return callback(verificationSecretKey, authSecretKey);
  } else {
    console.log(
      "VERIFICATION_CODE_SECRET_KEY and/or AUTH_SECRET_KEY were not found in environment variables."
    );
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      {
        body: "Something went wrong.",
      }
    );
  }
}

export function generateSignedVerificationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const verificationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return verificationCode;
}

type Decoded = { code: string } & jwt.JwtPayload;
export function extractVerificationCode(
  verificationCode: string,
  secretKey: string
): string {
  const { code } = jwt.verify(verificationCode, secretKey) as Decoded;
  return code;
}

function checkJWTExpired(jsonWebToken: string, secretKey: string): boolean {
  let isExpired = false;
  jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
    if (error) isExpired = true;
  });
  return isExpired;
}

// ========================================================================================= //
// [ ACCOUNT VERIFICATION HELPERS ] ======================================================== //
// ========================================================================================= //

export function handleAccountVerification<VerificationHandler>(
  response: Response,
  foundUser: User,
  verificationHandler: (
    verificationCode: string,
    authSecretKey: string
  ) => VerificationHandler
) {
  return handleSecretKeysExist(
    response,
    function (verificationSecretKey: string, authSecretKey: string) {
      if (foundUser.signedVerificationCode) {
        const verificationCodeExpired = checkJWTExpired(
          foundUser.signedVerificationCode,
          verificationSecretKey
        );

        // ↓↓↓ If the user's verification code expired. ↓↓↓ //
        if (verificationCodeExpired) {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: AuthErrors.VERIFICATION_CODE_EXPIRED,
          });
        }
        // ↓↓↓ If the user's verification code is still active. ↓↓↓ //
        else {
          const verificationCode = extractVerificationCode(
            foundUser.signedVerificationCode,
            verificationSecretKey
          );
          return verificationHandler(verificationCode, authSecretKey);
        }
      } else {
        return HttpHelpers.respondWithClientError(response, "bad request", {
          body: AuthErrors.ACCOUNT_HAS_NO_VERIFICATION_CODE,
        });
      }
    }
  );
}

// ========================================================================================= //
// [ EMAIL HELPERS ] ======================================================================= //
// ========================================================================================= //

export async function emailUser(
  userEmail: string,
  subject: string,
  body: string[]
) {
  if (process.env.NODE_ENV === "production") {
    const SMTPtransporter = nodemailer.createTransport({
      host: "smpt.gmail.email",
      port: 587,
      secure: true,
      auth: {
        user: process.env.EMAIL_HELP,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const html = body.map((text: string) => `<p>${text}</p>`).join("");
    const message = {
      from: `"Kujira" <${process.env.EMAIL_HELP}>`,
      to: userEmail,
      subject,
      html,
    };
    await SMTPtransporter.sendMail(message);
  } else {
    let testAccount = await nodemailer.createTestAccount();
    const SMTPtransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const html = body.map((text: string) => `<p>${text}</p>`).join("");
    const message = {
      from: `"Kujira" <foo@example.com>`,
      to: userEmail,
      subject,
      html,
    };
    const info = await SMTPtransporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
