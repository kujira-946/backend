import nodemailer from "nodemailer";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response } from "express";

import { HttpStatusCodes } from "../../utils/http-status-codes";

export function returnServerErrorOnUndefinedSecretKey(response: Response) {
  return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "Something went wrong.",
  });
}

export function generateVerificationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const verificationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return verificationCode;
}

export function extractVerificationCode(
  verificationCode: string,
  secretKey: string
) {
  const { code } = jwt.verify(verificationCode, secretKey) as {
    code: string;
  } & JwtPayload;
  return code;
}

export async function emailUser(
  userEmail: string,
  subject: string,
  body: string[]
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

  const html = body.map((text: string) => `<p>${text}</p>`).join();
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
