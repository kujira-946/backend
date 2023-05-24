import { PrismaClient, Purchase } from "@prisma/client";
import { Request, Response } from "express";
import nodemailer from "nodemailer";

import * as HttpHelpers from "../helpers/http.helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH USER BUG REPORTS ] ============================================================== //
// ========================================================================================= //

export async function fetchUserBugReports(
  request: Request<{}, {}, { userId: number }>,
  response: Response
) {
  try {
    const bugReports = await prisma.bug.findUniqueOrThrow({
      where: { id: request.body.userId },
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("user bug reports", true),
    });
  }
}

// ========================================================================================= //
// [ SEND BUG REPORT ] ===================================================================== //
// ========================================================================================= //

export async function sendBugReport(
  request: Request<{}, {}, { title: string; body?: string }>,
  response: Response
) {
  try {
    const message = {
      from: `"Kujira" <BUG REPORT>`,
      to: process.env.EMAIL_HELP,
      subject: request.body.title,
      text:
        request.body.body || "User did not describe the issue in more detail.",
    };

    const SMTPtransporter = nodemailer.createTransport({
      service: "hotmail",
      secure: false,
      auth: {
        user: process.env.EMAIL_HELP,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { ciphers: "SSLv3" },
    });

    SMTPtransporter.sendMail(message, function (error: any, information: any) {
      if (error) console.log(error);
      else console.log("Sent Response:", information.response);
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      title: "Bug report sent!",
      body: "Kujira is managed by only one person, so please be patient as you wait for your issue to get addressed.",
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      title: "Failed to send report.",
      body: "Please check to make sure you've filled in all of the required fields and try again.",
    });
  }
}
