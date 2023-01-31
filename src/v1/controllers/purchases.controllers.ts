import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/purchases.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL PURCHASES ] ================================================================= //
// ========================================================================================= //

export async function fetchPurchases(_: Request, response: Response) {
  try {
    const purchases: Validators.PurchaseRelationsValidator[] =
      await prisma.purchase.findMany({
        orderBy: { id: "asc" },
        include: {
          overviewRecurringPurchases: true,
          overviewIncomingPurchases: true,
          logbookDay: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return response.status(HttpStatusCodes.OK).json({ data: purchases });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("purchases") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE PURCHASE ] ================================================================== //
// ========================================================================================= //

export async function fetchPurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  try {
    const purchase: Validators.PurchaseRelationsValidator =
      await prisma.purchase.findUniqueOrThrow({
        where: { id: Number(request.params.purchaseId) },
        include: {
          overviewRecurringPurchases: true,
          overviewIncomingPurchases: true,
          logbookDay: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return response.status(HttpStatusCodes.OK).json({ data: purchase });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateFetchError("purchase", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A PURCHASE ] =================================================================== //
// ========================================================================================= //

export async function createPurchase(
  request: Request<{}, {}, Validators.PurchaseCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.PurchaseCreateValidator = {
      placement: request.body.placement,
      cost: request.body.cost,
      category: request.body.category,
      description: request.body.description,
    };

    const newPurchase: Validators.PurchaseRelationsValidator =
      await prisma.purchase.create({
        data: createData,
        include: {
          overviewRecurringPurchases: true,
          overviewIncomingPurchases: true,
          logbookDay: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "purchase"),
      data: newPurchase,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A PURCHASE ] =================================================================== //
// ========================================================================================= //

export async function updatePurchase(
  request: Request<
    { purchaseId: string },
    {},
    Validators.PurchaseUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.PurchaseUpdateValidator = {
      placement: request.body.placement,
      cost: request.body.cost,
      description: request.body.description,
      category: request.body.category,
    };

    const updatedPurchase: Validators.PurchaseRelationsValidator =
      await prisma.purchase.update({
        where: { id: Number(request.params.purchaseId) },
        data: updateData,
        include: {
          overviewRecurringPurchases: true,
          overviewIncomingPurchases: true,
          logbookDay: true,
          logbookReviewNeeds: true,
          logbookReviewPlannedWants: true,
          logbookReviewImpulsiveWants: true,
          logbookReviewRegrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("update", "purchase"),
      data: updatedPurchase,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A PURCHASE ] =================================================================== //
// ========================================================================================= //

export async function deletePurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  try {
    await prisma.purchase.delete({
      where: { id: Number(request.params.purchaseId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "purchase"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("delete", "purchase", true),
    });
  }
}
