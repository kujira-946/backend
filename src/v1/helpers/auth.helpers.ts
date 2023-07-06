import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { User } from "@prisma/client";

import * as HttpHelpers from "../helpers/http.helpers";
import { AuthErrors } from "../utils/auth.utils";

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
      { body: "Something went wrong." }
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
      if (foundUser.verificationCode) {
        const verificationCodeExpired = checkJWTExpired(
          foundUser.verificationCode,
          verificationSecretKey
        );

        if (verificationCodeExpired) {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: "Verification code expired. Please request a new verification code.",
          });
        } else {
          const verificationCode = extractVerificationCode(
            foundUser.verificationCode,
            verificationSecretKey
          );
          return verificationHandler(verificationCode, authSecretKey);
        }
      } else {
        return HttpHelpers.respondWithClientError(response, "bad request", {
          body: "Account does not have a verification code. Please try logging in, registering, or request a new verification code.",
        });
      }
    }
  );
}

// ========================================================================================= //
// [ EMAIL HELPERS ] ======================================================================= //
// ========================================================================================= //

export async function emailUser(
  emailAddress: string,
  subject: string,
  body: string[]
) {
  const html = body.map((text: string) => `<p>${text}</p>`).join("");
  const message = {
    from: `"Kujira" <${process.env.EMAIL_HELP}>`,
    to: emailAddress,
    subject,
    html,
  };

  // ↓↓↓ Development ↓↓↓ //
  // let devTestAccount = await nodemailer.createTestAccount();
  // const devSMTPtransporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: devTestAccount.user,
  //     pass: devTestAccount.pass,
  //   },
  // });
  // const testInfo = await devSMTPtransporter.sendMail(message);
  // console.log("Message sent: %s", testInfo.messageId);
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(testInfo));

  // ↓↓↓ Production ↓↓↓ //
  const prodSMTPtransporter = nodemailer.createTransport({
    service: "hotmail",
    secure: false,
    auth: {
      user: process.env.EMAIL_HELP,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { ciphers: "SSLv3" },
  });
  prodSMTPtransporter.sendMail(
    message,
    function (error: any, information: any) {
      if (error) console.log(error);
      else console.log("Sent Response:", information.response);
    }
  );
}
