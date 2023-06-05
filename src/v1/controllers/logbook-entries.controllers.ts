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
    const logbookEntries = await prisma.logbookEntry.findMany({
      orderBy: { id: "asc" },
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
// [ FETCH LOGBOOK LOGBOOK ENTRIES ] ======================================================= //
// ========================================================================================= //

export async function fetchLogbookLogbookEntries(
  request: Request<{}, {}, { logbookId: number }>,
  response: Response
) {
  try {
    const logbookEntries = await prisma.logbookEntry.findMany({
      orderBy: { id: "desc" },
      where: { logbookId: request.body.logbookId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: logbookEntries });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook entries", true),
    });
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
    const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
      where: { id: Number(request.params.logbookEntryId) },
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
  request: Request<{}, {}, Validators.LogbookEntryCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.LogbookEntryCreateValidator = {
      date: request.body.date,
      totalSpent: request.body.totalSpent,
      budget: request.body.budget,
      logbookId: request.body.logbookId,
    };

    const existingLogbookEntry = await prisma.logbookEntry.findFirst({
      where: { date: request.body.date },
    });

    if (!existingLogbookEntry) {
      const newLogbookEntry = await prisma.logbookEntry.create({
        data: createData,
      });
      return HttpHelpers.respondWithSuccess(response, "created", {
        body: HttpHelpers.generateCudMessage("create", "logbook entry"),
        data: newLogbookEntry,
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "A logbook entry for today already exists.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK ENTRY ] ============================================================== //
// ========================================================================================= //

export async function updateLogbookEntry(
  request: Request<
    { logbookEntryId: string },
    {},
    Validators.LogbookEntryUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.LogbookEntryUpdateValidator = {
      date: request.body.date,
      totalSpent: request.body.totalSpent,
      budget: request.body.budget,
      logbookId: request.body.logbookId,
    };

    const updatedLogbookEntry: Validators.LogbookEntryUpdateValidator =
      await prisma.logbookEntry.update({
        where: { id: Number(request.params.logbookEntryId) },
        data: updateData,
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook entry"),
      data: updatedLogbookEntry,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "A logbook entry with that date already exists.",
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
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook entry", true),
    });
  }
}
