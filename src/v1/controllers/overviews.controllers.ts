import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/overviews.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL OVERVIEWS ] ================================================================= //
// ========================================================================================= //

export async function fetchOverviews(_: Request, response: Response) {
  try {
    const overviews: Validators.OverviewRelationsValidator[] =
      await prisma.overview.findMany({
        orderBy: { id: "asc" },
        include: { recurringPurchases: true, incomingPurchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: overviews });
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
    const overview: Validators.OverviewRelationsValidator =
      await prisma.overview.findUniqueOrThrow({
        where: { id: Number(request.params.overviewId) },
        include: { recurringPurchases: true, incomingPurchases: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: overview });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE AN OVERVIEW ] ================================================================== //
// ========================================================================================= //

export async function createOverview(
  request: Request<{ ownerId: string }, {}, Validators.OverviewCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.OverviewCreateValidator = {
      income: request.body.income,
      savings: request.body.savings,
      ownerId: Number(request.params.ownerId),
    };

    const newOverview: Validators.OverviewRelationsValidator =
      await prisma.overview.create({
        data: createData,
        include: { recurringPurchases: true, incomingPurchases: true },
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

export async function updateOverview(
  request: Request<
    { overviewId: string },
    {},
    Validators.OverviewUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.OverviewUpdateValidator = {
      income: request.body.income,
      savings: request.body.savings,
    };

    const updatedOverview: Validators.OverviewRelationsValidator =
      await prisma.overview.update({
        where: { id: Number(request.params.overviewId) },
        data: updateData,
        include: { recurringPurchases: true, incomingPurchases: true },
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
