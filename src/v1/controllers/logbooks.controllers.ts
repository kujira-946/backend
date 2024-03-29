import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/logbooks.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOKS ] ================================================================== //
// ========================================================================================= //

export async function fetchLogbooks(_: Request, response: Response) {
  try {
    const logbooks = await prisma.logbook.findMany({
      orderBy: { id: "asc" },
      include: { entries: { include: { purchases: true } } },
    });

    return response.status(HttpStatusCodes.OK).json({ data: logbooks });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbooks") }
    );
  }
}

// ========================================================================================= //
// [ FETCH USER LOGBOOKS ] ================================================================= //
// ========================================================================================= //

export async function fetchUserLogbooks(
  request: Request<{}, {}, Validators.FetchUserLogbooksValidator>,
  response: Response
) {
  try {
    const logbooks = await prisma.logbook.findMany({
      orderBy: { id: "asc" },
      where: { ownerId: request.body.ownerId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: logbooks });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbooks", true),
    });
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK ] =================================================================== //
// ========================================================================================= //

export async function fetchLogbook(
  request: Request<{ logbookId: string }>,
  response: Response
) {
  try {
    const logbook = await prisma.logbook.findUniqueOrThrow({
      where: { id: Number(request.params.logbookId) },
      include: { entries: { include: { purchases: true } } },
    });

    return response.status(HttpStatusCodes.OK).json({ data: logbook });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK ] ==================================================================== //
// ========================================================================================= //

export async function createLogbook(
  request: Request<{}, {}, Validators.LogbookCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.LogbookCreateValidator = {
      name: request.body.name,
      ownerId: request.body.ownerId,
    };

    const newLogbook = await prisma.logbook.create({
      data: createData,
      include: { entries: { include: { purchases: true } } },
    });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "logbook"),
      data: newLogbook,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "logbook", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK ] ==================================================================== //
// ========================================================================================= //

export async function updateLogbook(
  request: Request<
    { logbookId: string },
    {},
    Validators.LogbookUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.LogbookUpdateValidator = {
      name: request.body.name,
    };

    const updatedLogbook = await prisma.logbook.update({
      where: { id: Number(request.params.logbookId) },
      data: updateData,
      include: { entries: { include: { purchases: true } } },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook"),
      data: updatedLogbook,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "logbook", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK ] ==================================================================== //
// ========================================================================================= //

export async function deleteLogbook(
  request: Request<{ logbookId: string }>,
  response: Response
) {
  try {
    await prisma.logbook.delete({
      where: { id: Number(request.params.logbookId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "logbook"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook", true),
    });
  }
}
