import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Validators from "../validators/logbook-entries.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOK ENTRIES ] =========================================================== //
// ========================================================================================= //

export async function fetchLogbookEntries(_: Request, response: Response) {
  try {
    const logbookEntries: Validators.LogbookEntryRelationsValidator[] =
      await prisma.logbookEntry.findMany({
        orderBy: { id: "asc" },
        include: { purchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookEntries });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbook entries") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK ENTRY ] ============================================================= //
// ========================================================================================= //

export async function fetchLogbookEntry(
  request: Request<{ logbookEntryId: string }>,
  response: Response
) {
  try {
    const logbookEntry: Validators.LogbookEntryRelationsValidator =
      await prisma.logbookEntry.findUniqueOrThrow({
        where: { id: Number(request.params.logbookEntryId) },
        include: { purchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookEntry });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook entry", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK ENTRY ] ============================================================== //
// ========================================================================================= //

export async function createLogbookEntry(
  request: Request<{ logbookId: string }, {}, { date: Date }>,
  response: Response
) {
  try {
    const createData: Validators.LogbookEntryCreateValidator = {
      logbookId: Number(request.params.logbookId),
      date: request.body.date,
    };

    const newLogbookEntry: Validators.LogbookEntryRelationsValidator =
      await prisma.logbookEntry.create({
        data: createData,
        include: { purchases: true },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "logbook entry"),
      data: newLogbookEntry,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "logbook entry", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK ENTRY ] ============================================================== //
// ========================================================================================= //

export async function updateLogbookEntry(
  request: Request<
    { logbookEntryId: string; logbookId?: string },
    {},
    { date?: Date; totalCost?: number }
  >,
  response: Response
) {
  try {
    const updateData: Validators.LogbookEntryUpdateValidator = {
      logbookId: Number(request.params.logbookId),
      date: request.body.date,
      totalCost: request.body.totalCost,
    };

    const updatedLogbookEntry: Validators.LogbookEntryUpdateValidator =
      await prisma.logbookEntry.update({
        where: { id: Number(request.params.logbookEntryId) },
        data: updateData,
        include: { purchases: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook entry"),
      data: updatedLogbookEntry,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "logbook entry", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK ENTRY ] ============================================================== //
// ========================================================================================= //

export async function deleteLogbookEntry(
  request: Request<{ logbookEntryId: string }>,
  response: Response
) {
  try {
    await prisma.logbookEntry.delete({
      where: { id: Number(request.params.logbookEntryId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "logbook entry"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook entry", true),
    });
  }
}
