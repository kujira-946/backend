import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/overview-group.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL OVERVIEW GROUPS ] =========================================================== //
// ========================================================================================= //

export async function fetchOverviewGroups(_: Request, response: Response) {
  try {
    const overviewGroups: Validators.OverviewGroupRelationsValidator[] =
      await prisma.overviewGroup.findMany({
        orderBy: { id: "asc" },
        include: { purchases: true },
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
// [ FETCH ONE OVERVIEW GROUP ] ============================================================ //
// ========================================================================================= //

export async function fetchOverviewGroup(
  request: Request<{ overviewGroupId: string }>,
  response: Response
) {
  try {
    const overviewGroup: Validators.OverviewGroupRelationsValidator =
      await prisma.overviewGroup.findUniqueOrThrow({
        where: { id: Number(request.params.overviewGroupId) },
        include: { purchases: true },
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
      totalCost: request.body.totalCost,
      overviewId: request.body.overviewId,
    };

    const newOverviewGroup: Validators.OverviewGroupRelationsValidator =
      await prisma.overviewGroup.create({
        data: createData,
        include: { purchases: true },
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
      totalCost: request.body.totalCost,
      overviewId: request.body.overviewId,
    };

    const updatedOverviewGroup: Validators.OverviewGroupRelationsValidator =
      await prisma.overviewGroup.update({
        where: { id: Number(request.params.overviewGroupId) },
        data: updateData,
        include: { purchases: true },
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
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "overview group", true),
    });
  }
}
