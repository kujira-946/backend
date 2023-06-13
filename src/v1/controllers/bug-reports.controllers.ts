import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/bug-reports.validators";
import * as Services from "../services/bug-reports.services";
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

    Services.emailBugReportToKujiraHelp(
      bugReport.title,
      bugReport.body,
      user.id,
      user.username
    );

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

// ========================================================================================= //
// [ DELETE BUG REPORT ] =================================================================== //
// ========================================================================================= //

export async function deleteBugReport(
  request: Request<{ bugReportId: string }>,
  response: Response
) {
  try {
    await prisma.bugReport.delete({
      where: { id: Number(request.params.bugReportId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "bug report"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "bug report", true),
    });
  }
}
