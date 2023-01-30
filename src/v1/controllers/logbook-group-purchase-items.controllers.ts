import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Types from "../types/logbook-group-purchase-items.types";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOK GROUP PURCHASE ITEMS ] ============================================== //
// ========================================================================================= //

export async function fetchLogbookGroupPurchaseItems(
  _: Request,
  response: Response
) {
  try {
    const logbookGroupPurchaseItems: Types.LogbookGroupPurchaseItemsWithRelations[] =
      await prisma.logbookGroupPurchaseItem.findMany({
        orderBy: { id: "asc" },
        include: {
          logbookGroup: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return response
      .status(HttpStatusCodes.OK)
      .json({ data: logbookGroupPurchaseItems });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbook group purchase items") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK GROUP PURCHASE ITEM ] =============================================== //
// ========================================================================================= //

export async function fetchLogbookGroupPurchaseItem(
  request: Request<{ itemId: string }>,
  response: Response
) {
  try {
    const logbookGroupPurchaseItem: Types.LogbookGroupPurchaseItemsWithRelations =
      await prisma.logbookGroupPurchaseItem.findUniqueOrThrow({
        where: { id: Number(request.params.itemId) },
        include: {
          logbookGroup: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return response
      .status(HttpStatusCodes.OK)
      .json({ data: logbookGroupPurchaseItem });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError(
        "logbook group purchase item",
        false
      ),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK GROUP PURCHASE ITEM ] ================================================ //
// ========================================================================================= //

export async function createLogbookGroupPurchaseItem(
  request: Request<
    { logbookGroupId: string },
    {},
    {
      placement: number;
      cost: number;
      category: "need" | "want";
      description: string;
    }
  >,
  response: Response
) {
  try {
    const createData: Types.LogbookCreateData = {
      placement: request.body.placement,
      cost: request.body.cost,
      category: request.body.category,
      description: request.body.description,
      logbookGroupId: Number(request.params.logbookGroupId),
    };

    const newLogbookGroupPurchaseItem: Types.LogbookGroupPurchaseItemsWithRelations =
      await prisma.logbookGroupPurchaseItem.create({
        data: createData,
        include: {
          logbookGroup: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage(
        "create",
        "logbook group purchase item"
      ),
      data: newLogbookGroupPurchaseItem,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "create",
        "logbook group purchase item",
        true
      ),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK GROUP PURCHASE ITEM (placement is handled in another controller) ] === //
// ========================================================================================= //

export async function updateLogbookGroupPurchaseItem(
  request: Request<
    { itemId: string },
    {},
    {
      cost?: number;
      category?: "need" | "want";
      description?: string;
    }
  >,
  response: Response
) {
  try {
    const updateData: Types.LogbookUpdateData = {
      cost: request.body.cost,
      category: request.body.category,
      description: request.body.description,
    };

    const updatedLogbook: Types.LogbookGroupPurchaseItemsWithRelations =
      await prisma.logbookGroupPurchaseItem.update({
        where: { id: Number(request.params.itemId) },
        data: updateData,
        include: {
          logbookGroup: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "logbook group purchase item"
      ),
      data: updatedLogbook,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "logbook group purchase item",
        true
      ),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK GROUP PURCHASE ITEM PLACEMENT ] ====================================== //
// ========================================================================================= //

export async function updateLogbookGroupPurchaseItemPlacement(
  request: Request<{ itemId: string }, {}, { placement?: number }>,
  response: Response
) {
  try {
    const updateData: Types.LogbookUpdateData = {
      placement: request.body.placement,
    };

    const updatedLogbookPlacement: Types.LogbookGroupPurchaseItemsWithRelations =
      await prisma.logbookGroupPurchaseItem.update({
        where: { id: Number(request.params.itemId) },
        data: updateData,
        include: {
          logbookGroup: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "logbook group purchase item placement"
      ),
      data: updatedLogbookPlacement,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "logbook group purchase item placement",
        true
      ),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK GROUP PURCHASE ITEM ] ================================================ //
// ========================================================================================= //

export async function deleteLogbookGroupPurchaseItem(
  request: Request<{ itemId: string }>,
  response: Response
) {
  try {
    await prisma.logbookGroupPurchaseItem.delete({
      where: { id: Number(request.params.itemId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage(
        "delete",
        "logbook group purchase item"
      ),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage(
        "delete",
        "logbook group purchase item",
        true
      ),
    });
  }
}
