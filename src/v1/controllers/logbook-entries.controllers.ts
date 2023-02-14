import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Validators from "../validators/logbook-entries.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOK DAYS ] ============================================================== //
// ========================================================================================= //

export async function fetchLogbookDays(_: Request, response: Response) {
  try {
    const logbookDays: Validators.LogbookDayRelationsValidator[] =
      await prisma.logbookDay.findMany({
        orderBy: { id: "asc" },
        include: { purchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookDays });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbook days") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK DAY ] =============================================================== //
// ========================================================================================= //

export async function fetchLogbookDay(
  request: Request<{ logbookDayId: string }>,
  response: Response
) {
  try {
    const logbookDay: Validators.LogbookDayRelationsValidator =
      await prisma.logbookDay.findUniqueOrThrow({
        where: { id: Number(request.params.logbookDayId) },
        include: { purchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookDay });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook day", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK DAY ] ================================================================ //
// ========================================================================================= //

export async function createLogbookDay(
  request: Request<{ logbookId: string }, {}, { date: Date }>,
  response: Response
) {
  try {
    const createData: Validators.LogbookDayCreateValidator = {
      logbookId: Number(request.params.logbookId),
      date: request.body.date,
    };

    const newLogbookDay: Validators.LogbookDayRelationsValidator =
      await prisma.logbookDay.create({
        data: createData,
        include: { purchases: true },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "logbook day"),
      data: newLogbookDay,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "logbook day", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK DAY ] ================================================================ //
// ========================================================================================= //

export async function updateLogbookDay(
  request: Request<
    { logbookDayId: string; logbookId?: string },
    {},
    { date?: Date; totalCost?: number }
  >,
  response: Response
) {
  try {
    const updateData: Validators.LogbookDayUpdateValidator = {
      logbookId: Number(request.params.logbookId),
      date: request.body.date,
      totalCost: request.body.totalCost,
    };

    const updatedLogbookDay: Validators.LogbookDayUpdateValidator =
      await prisma.logbookDay.update({
        where: { id: Number(request.params.logbookDayId) },
        data: updateData,
        include: { purchases: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook day"),
      data: updatedLogbookDay,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "logbook day", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK DAY ] ================================================================ //
// ========================================================================================= //

export async function deleteLogbookDay(
  request: Request<{ logbookDayId: string }>,
  response: Response
) {
  try {
    await prisma.logbookDay.delete({
      where: { id: Number(request.params.logbookDayId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "logbook day"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook day", true),
    });
  }
}
