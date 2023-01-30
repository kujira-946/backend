import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/logbooks.types";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOKS ] ================================================================== //
// ========================================================================================= //

export async function fetchLogbooks(_: Request, response: Response) {
  try {
    const logbooks: Types.LogbookWithRelations[] =
      await prisma.logbook.findMany({
        orderBy: { id: "asc" },
        include: { groups: true, owner: true },
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
// [ FETCH ONE LOGBOOK ] =================================================================== //
// ========================================================================================= //

export async function fetchLogbook(
  request: Request<{ logbookId: string }>,
  response: Response
) {
  try {
    const logbook: Types.LogbookWithRelations =
      await prisma.logbook.findUniqueOrThrow({
        where: { id: Number(request.params.logbookId) },
        include: { groups: true, owner: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbook });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError("logbook", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK ] ==================================================================== //
// ========================================================================================= //

export async function createLogbook(
  request: Request<{ ownerId: string }, {}, { name: string }>,
  response: Response
) {
  try {
    const createData: Types.LogbookCreateData = {
      name: request.body.name,
      ownerId: Number(request.params.ownerId),
    };

    const newLogbook: Types.LogbookWithRelations = await prisma.logbook.create({
      data: createData,
      include: { groups: true, owner: true },
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
  request: Request<{ logbookId: string }, {}, { name: string }>,
  response: Response
) {
  try {
    const updateData: Types.LogbookUpdateData = { name: request.body.name };

    const updatedLogbook: Types.LogbookWithRelations =
      await prisma.logbook.update({
        where: { id: Number(request.params.logbookId) },
        data: updateData,
        include: { groups: true, owner: true },
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
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook", true),
    });
  }
}
