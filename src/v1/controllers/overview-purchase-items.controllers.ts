import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/overview-purchase-items.types";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL OVERVIEW PURCHASE ITEMS ] =================================================== //
// ========================================================================================= //

export async function fetchOverviewPurchaseItems(
  request: Request,
  response: Response
) {
  try {
    const overviewPurchaseItems: Types.OverviewPurchaseItemsWithRelations[] =
      await prisma.overviewPurchaseItem.findMany({
        orderBy: { id: "asc" },
        include: { overviewRecurringCost: true, overviewIncomingCost: true },
      });

    return response
      .status(HttpStatusCodes.OK)
      .json({ data: overviewPurchaseItems });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("overview purchase items") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE OVERVIEW PURCHASE ITEM ] ==================================================== //
// ========================================================================================= //

export async function fetchOverviewPurchaseItem(
  request: Request<{ itemId: string }>,
  response: Response
) {
  try {
    const overviewPurchaseItem: Types.OverviewPurchaseItemsWithRelations =
      await prisma.overviewPurchaseItem.findUniqueOrThrow({
        where: { id: Number(request.params.itemId) },
        include: { overviewRecurringCost: true, overviewIncomingCost: true },
      });

    return response
      .status(HttpStatusCodes.OK)
      .json({ data: overviewPurchaseItem });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError("overview purchase item", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE AN OVERVIEW PURCHASE ITEM ] ==================================================== //
// ========================================================================================= //

export async function createOverviewPurchaseItem(
  request: Request<{}, {}, { description: string; cost: number }>,
  response: Response
) {
  try {
    const createData: Types.OverviewPurchaseItemsCreateData = {
      description: request.body.description,
      cost: request.body.cost,
    };

    const newOverviewPurchaseItem: Types.OverviewPurchaseItemsWithRelations =
      await prisma.overviewPurchaseItem.create({
        data: createData,
        include: { overviewRecurringCost: true, overviewIncomingCost: true },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "overview purchase item"),
      data: newOverviewPurchaseItem,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "create",
        "overview purchase item",
        true
      ),
    });
  }
}

// ========================================================================================= //
// [ UPDATE AN OVERVIEW PURCHASE ITEM ] ==================================================== //
// ========================================================================================= //

export async function updateOverviewPurchaseItem(
  request: Request<
    { itemId: string },
    {},
    { description?: string; cost?: number }
  >,
  response: Response
) {
  try {
    const updateData: Types.OverviewPurchaseItemsUpdateData = {
      cost: request.body.cost,
      description: request.body.description,
    };

    const updatedOverviewPurchaseItem: Types.OverviewPurchaseItemsWithRelations =
      await prisma.overviewPurchaseItem.update({
        where: { id: Number(request.params.itemId) },
        data: updateData,
        include: { overviewRecurringCost: true, overviewIncomingCost: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "overview purchase item"),
      data: updatedOverviewPurchaseItem,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "overview purchase item",
        true
      ),
    });
  }
}

// ========================================================================================= //
// [ DELETE AN OVERVIEW PURCHASE ITEM ] ==================================================== //
// ========================================================================================= //

export async function deleteOverviewPurchaseItem(
  request: Request<{ itemId: string }>,
  response: Response
) {
  try {
    await prisma.overviewPurchaseItem.delete({
      where: { id: Number(request.params.itemId) },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "overview purchase item"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage(
        "delete",
        "overview purchase item",
        true
      ),
    });
  }
}
