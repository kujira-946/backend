import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/logbook-groups.types";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOK GROUPS ] ============================================================ //
// ========================================================================================= //

export async function fetchLogbookGroups(_: Request, response: Response) {
  try {
    const logbookGroups: Types.LogbookGroupsWithRelations[] =
      await prisma.logbookGroup.findMany({
        orderBy: { id: "asc" },
        include: { items: true, logbook: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookGroups });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbook groups") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK GROUP ] =================================================================== //
// ========================================================================================= //

export async function fetchLogbookGroup(
  request: Request<{ logbookGroupId: string }>,
  response: Response
) {
  try {
    const logbookGroup: Types.LogbookGroupsWithRelations =
      await prisma.logbookGroup.findUniqueOrThrow({
        where: { id: Number(request.params.logbookGroupId) },
        include: { items: true, logbook: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: logbookGroup });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError("logbook group", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK GROUP ] ==================================================================== //
// ========================================================================================= //

export async function createLogbookGroup(
  request: Request<{ logbookId: string }, {}, { date: Date }>,
  response: Response
) {
  try {
    const createData: Types.LogbookGroupsCreateData = {
      date: request.body.date,
      logbookId: Number(request.params.logbookId),
    };

    const newLogbookGroup: Types.LogbookGroupsWithRelations =
      await prisma.logbookGroup.create({
        data: createData,
        include: { items: true, logbook: true },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "logbook group"),
      data: newLogbookGroup,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "logbook group", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK GROUP ] ==================================================================== //
// ========================================================================================= //

export async function updateLogbookGroup(
  request: Request<
    { logbookGroupId: string },
    {},
    { date: Date; totalCost: number }
  >,
  response: Response
) {
  try {
    const updateData: Types.LogbookGroupsUpdateData = {
      date: request.body.date,
      totalCost: request.body.totalCost,
    };

    const updatedLogbookGroup: Types.LogbookGroupsWithRelations =
      await prisma.logbookGroup.update({
        where: { id: Number(request.params.logbookGroupId) },
        data: updateData,
        include: { items: true, logbook: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook group"),
      data: updatedLogbookGroup,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "logbook group", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK GROUP ] ==================================================================== //
// ========================================================================================= //

export async function deleteLogbookGroup(
  request: Request<{ logbookGroupId: string }>,
  response: Response
) {
  try {
    await prisma.logbookGroup.delete({
      where: { id: Number(request.params.logbookGroupId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "logbook group"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook group", true),
    });
  }
}
