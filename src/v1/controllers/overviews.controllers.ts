import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/overviews.types";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL OVERVIEWS ] ================================================================= //
// ========================================================================================= //

export async function fetchOverviews(_: Request, response: Response) {
  try {
    const overviews: Types.OverviewWithRelations[] =
      await prisma.overview.findMany({
        orderBy: { id: "asc" },
        include: { recurringCosts: true, incomingCosts: true },
      });
    return response.status(HttpStatusCodes.OK).json(overviews);
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("overviews") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE OVERVIEW ] ================================================================== //
// ========================================================================================= //

export async function fetchOverview(
  request: Request<{ overviewId: string }>,
  response: Response
) {
  try {
    const overview: Types.OverviewWithRelations =
      await prisma.overview.findUniqueOrThrow({
        where: { id: Number(request.params.overviewId) },
        include: { recurringCosts: true, incomingCosts: true },
      });
    return response.status(HttpStatusCodes.OK).json(overview);
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError("overview", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE AN OVERVIEW ] ================================================================== //
// ========================================================================================= //

type CreateRequest = Request<
  { ownerId: string },
  {},
  {
    income?: number;
    savings: number;
  }
>;

export async function createOverview(
  request: CreateRequest,
  response: Response
) {
  try {
    const overviewCreateData: Types.OverviewCreateData = {
      savings: request.body.savings,
      ownerId: Number(request.params.ownerId),
    };
    if (request.body.income) overviewCreateData["income"] = request.body.income;

    const newOverview: Types.OverviewWithRelations =
      await prisma.overview.create({
        data: overviewCreateData,
        include: { recurringCosts: true, incomingCosts: true },
      });
    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "overview"),
      data: newOverview,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "overview", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE AN OVERVIEW ] ================================================================== //
// ========================================================================================= //

type UpdateRequest = Request<
  { overviewId: string },
  {},
  { income?: number; savings: number }
>;

export async function updateOverview(
  request: UpdateRequest,
  response: Response
) {
  try {
    const updateData: Types.OverviewUpdateData = {
      income: request.body.income,
      savings: request.body.savings,
    };

    const updatedOverview: Types.OverviewWithRelations =
      await prisma.overview.update({
        where: { id: Number(request.params.overviewId) },
        data: updateData,
        include: { recurringCosts: true, incomingCosts: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "overview"),
      data: updatedOverview,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "overview", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE AN OVERVIEW ] ================================================================== //
// ========================================================================================= //

export async function deleteOverview(
  request: Request<{ overviewId: string }>,
  response: Response
) {
  try {
    await prisma.overview.delete({
      where: { id: Number(request.params.overviewId) },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "overview"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "overview", true),
    });
  }
}
