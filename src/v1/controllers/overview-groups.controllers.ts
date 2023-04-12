import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/overview-groups.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL OVERVIEW GROUPS ] =========================================================== //
// ========================================================================================= //

export async function fetchOverviewGroups(_: Request, response: Response) {
  try {
    const overviewGroups = await prisma.overviewGroup.findMany({
      orderBy: { id: "asc" },
    });

    return response.status(HttpStatusCodes.OK).json({ data: overviewGroups });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("overview groups") }
    );
  }
}

// ========================================================================================= //
// [ FETCH OVERVIEW OVERVIEW GROUPS ] ================================================================ //
// ========================================================================================= //

export async function fetchOverviewOverviewGroups(
  request: Request<{}, {}, { overviewId: number }>,
  response: Response
) {
  try {
    const overviewGroups = await prisma.overviewGroup.findMany({
      orderBy: { id: "asc" },
      where: { overviewId: request.body.overviewId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: overviewGroups });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview groups", true),
    });
  }
}

// ========================================================================================= //
// [ BULK FETCH OVERVIEW GROUPS ] ========================================================== //
// ========================================================================================= //

export async function bulkFetchOverviewGroups(
  request: Request<{}, {}, { overviewGroupIds: number[] }>,
  response: Response
) {
  try {
    const overviewGroups = await prisma.overviewGroup.findMany({
      orderBy: { id: "asc" },
      where: { id: { in: request.body.overviewGroupIds } },
    });

    return response.status(HttpStatusCodes.OK).json({ data: overviewGroups });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview groups", true),
    });
  }
}

// ========================================================================================= //
// [ FETCH ONE OVERVIEW GROUP ] ============================================================ //
// ========================================================================================= //

export async function fetchOverviewGroup(
  request: Request<{ overviewGroupId: string }>,
  response: Response
) {
  try {
    const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
      where: { id: Number(request.params.overviewGroupId) },
    });

    return response.status(HttpStatusCodes.OK).json({ data: overviewGroup });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview group", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE AN OVERVIEW GROUP ] ============================================================ //
// ========================================================================================= //

export async function createOverviewGroup(
  request: Request<{}, {}, Validators.OverviewGroupCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.OverviewGroupCreateValidator = {
      name: request.body.name,
      totalSpent: request.body.totalSpent,
      overviewId: request.body.overviewId,
    };

    const newOverviewGroup = await prisma.overviewGroup.create({
      data: createData,
    });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "overview group"),
      data: newOverviewGroup,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "overview group", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE AN OVERVIEW GROUP ] ============================================================ //
// ========================================================================================= //

export async function updateOverviewGroup(
  request: Request<
    { overviewGroupId: string },
    {},
    Validators.OverviewGroupUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.OverviewGroupUpdateValidator = {
      name: request.body.name,
      totalSpent: request.body.totalSpent,
      overviewId: request.body.overviewId,
    };

    const updatedOverviewGroup = await prisma.overviewGroup.update({
      where: { id: Number(request.params.overviewGroupId) },
      data: updateData,
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "overview group"),
      data: updatedOverviewGroup,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "overview group", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE AN OVERVIEW GROUP ] ============================================================ //
// ========================================================================================= //

export async function deleteOverviewGroup(
  request: Request<{ overviewGroupId: string }>,
  response: Response
) {
  try {
    await prisma.overviewGroup.delete({
      where: { id: Number(request.params.overviewGroupId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "overview group"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "overview group", true),
    });
  }
}
