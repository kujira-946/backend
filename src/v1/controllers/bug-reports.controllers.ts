import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import nodemailer from "nodemailer";

import * as Validators from "../validators/bug-reports.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH USER BUG REPORTS ] ============================================================== //
// ========================================================================================= //

export async function fetchUserBugReports(
  request: Request<{}, {}, { ownerId: number }>,
  response: Response
) {
  try {
    const bugReports = await prisma.bugReport.findMany({
      where: { ownerId: request.body.ownerId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: bugReports });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("user bug reports", true),
    });
  }
}

// ========================================================================================= //
// [ CREATE BUG REPORT ] =================================================================== //
// ========================================================================================= //

export async function createBugReport(
  request: Request<{}, {}, Validators.BugReportsCreateValidator>,
  response: Response
) {
  try {
    const bugReport = await prisma.bugReport.create({
      data: {
        title: request.body.title,
        body: request.body.body,
        ownerId: request.body.ownerId,
      },
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.body.ownerId },
    });

    const message = {
      from: `"KUJIRA BUG REPORT" <${process.env.EMAIL_HELP}>`,
      to: process.env.EMAIL_HELP,
      subject: bugReport.title,
      html: [
        `<p>Sent by user with ID: <b>${user.id}</b> and USERNAME: <b>${user.username}</b></p>`,
        `<p>${
          bugReport.body || "User did not describe the issue in more detail."
        }</p>`,
      ].join(""),
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
      body: "Please properly fill in all required fields and try again.",
    });
  }
}
