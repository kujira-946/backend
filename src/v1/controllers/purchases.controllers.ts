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
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
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
// [ FETCH OVERVIEW GROUP PURCHASES ] ================================================================ //
// ========================================================================================= //

export async function fetchOverviewGroupPurchases(
  request: Request<{}, {}, { overviewGroupId: number }>,
  response: Response
) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
      where: { overviewGroupId: request.body.overviewGroupId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: purchases });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview group purchases", true),
    });
  }
}

// ========================================================================================= //
// [ FETCH LOGBOOK PURCHASES ] ================================================================ //
// ========================================================================================= //

export async function fetchLogbookEntryPurchases(
  request: Request<{}, {}, { logbookEntryId: number }>,
  response: Response
) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
      where: { logbookEntryId: request.body.logbookEntryId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: purchases });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("overview group purchases", true),
    });
  }
}

// ========================================================================================= //
// [ BULK FETCH PURCHASES ] ================================================================ //
// ========================================================================================= //

export async function bulkFetchPurchases(
  request: Request<{}, {}, { purchaseIds: number[] }>,
  response: Response
) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
      where: { id: { in: request.body.purchaseIds } },
    });

    return response.status(HttpStatusCodes.OK).json({ data: purchases });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("purchases", true),
    });
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
    const purchase = await prisma.purchase.findUniqueOrThrow({
      where: { id: Number(request.params.purchaseId) },
    });

    return response.status(HttpStatusCodes.OK).json({ data: purchase });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
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
      category: request.body.category,
      description: request.body.description,
      cost: request.body.cost,
      overviewGroupId: request.body.overviewGroupId,
      logbookEntryId: request.body.logbookEntryId,
    };

    const newPurchase = await prisma.purchase.create({
      data: createData,
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
// [ BULK CREATE PURCHASES ] =============================================================== //
// ========================================================================================= //

export async function bulkCreatePurchases(
  request: Request<
    {},
    {},
    { purchasesData: Validators.PurchaseCreateValidator[] }
  >,
  response: Response
) {
  try {
    const newPurchases = await prisma.purchase.createMany({
      data: request.body.purchasesData,
      skipDuplicates: true,
    });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "purchases"),
      data: newPurchases,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "purchases", true),
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
      category: request.body.category,
      description: request.body.description,
      cost: request.body.cost,
      overviewGroupId: request.body.overviewGroupId,
      logbookEntryId: request.body.logbookEntryId,
    };

    const updatedPurchase = await prisma.purchase.update({
      where: { id: Number(request.params.purchaseId) },
      data: updateData,
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
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
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ BATCH DELETE ] ======================================================================== //
// ========================================================================================= //

export async function batchDeletePurchases(
  request: Request<{}, {}, { purchaseIds: number[] }>,
  response: Response
) {
  try {
    await prisma.purchase.deleteMany({
      where: { id: { in: request.body.purchaseIds } },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "One or more of the selected purchases already don't exist. Please refresh the page and try again.",
    });
  }
}

// ========================================================================================= //
// [ DELETE ALL ] ========================================================================== //
// ========================================================================================= //

export async function deleteAllPurchases(
  request: Request<
    {},
    {},
    { overviewGroupId?: number; logbookEntryId?: number }
  >,
  response: Response
) {
  try {
    await prisma.purchase.deleteMany({
      where: {
        overviewGroupId: request.body.overviewGroupId,
        logbookEntryId: request.body.logbookEntryId,
      },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "all purchases"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "Failed to delete all purchases. Please refresh the page and try again.",
    });
  }
}
