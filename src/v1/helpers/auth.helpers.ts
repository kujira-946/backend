import { Response } from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import { HttpStatusCodes } from "../../utils/http-status-codes";

export async function sendUserConfirmationEmail(
  email: string,
  subject: string,
  text: string,
  confirmationCode: string
) {
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

  const confirmationMessage = {
    from: `"Kujira" <foo@example.com>`,
    to: email,
    subject,
    html: `
      <p>${text}</p>
      <p>Please copy and paste the following confirmation code into the app: ${confirmationCode}</p>
    `,
  };
  const info = await SMTPtransporter.sendMail(confirmationMessage);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export function generateEmailConfirmationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const confirmationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return confirmationCode;
}

export function handleJWTSecretKeyFetch(response: Response) {
  const tokenSecretKey = process.env.TOKEN_SECRET_KEY;
  if (!tokenSecretKey) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Something went wrong.",
    });
  } else {
    return tokenSecretKey;
  }
}
