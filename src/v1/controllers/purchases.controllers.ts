import { Category, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/purchases.validators";
import * as Services from "../services/purchases.services";
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
// [ FETCH OVERVIEW GROUP PURCHASES ] ====================================================== //
// ========================================================================================= //

export async function fetchOverviewGroupPurchases(
  request: Request<{}, {}, Validators.FetchOverviewGroupPurchasesValidator>,
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
// [ FETCH LOGBOOK ENTRY PURCHASES ] ======================================================= //
// ========================================================================================= //

export async function fetchLogbookEntryPurchases(
  request: Request<{}, {}, Validators.FetchLogbookEntryPurchasesValidator>,
  response: Response
) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { placement: "asc" },
      where: { logbookEntryId: request.body.logbookEntryId },
    });

    return response.status(HttpStatusCodes.OK).json({ data: purchases });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook entry purchases", true),
    });
  }
}

// ========================================================================================= //
// [ FETCH LOGBOOK ENTRY PURCHASES BY CATEGORY ] =========================================== //
// ========================================================================================= //

export async function fetchLogbookEntryPurchasesByCategory(
  request: Request<{}, {}, { logbookEntryIds: number[] }>,
  response: Response
) {
  try {
    // const needPurchases: Purchase[] = [];
    // const plannedPurchases: Purchase[] = [];
    // const impulsePurchases: Purchase[] = [];

    // for (const logbookEntryId of request.body.logbookEntryIds) {
    //   const needCategoryPurchases = await prisma.purchase.findMany({
    //     orderBy: { id: "asc" },
    //     where: { logbookEntryId: logbookEntryId, category: "need" },
    //   });
    //   needPurchases.push(...needCategoryPurchases);

    //   const plannedCategoryPurchases = await prisma.purchase.findMany({
    //     orderBy: { id: "asc" },
    //     where: { logbookEntryId: logbookEntryId, category: "planned" },
    //   });
    //   plannedPurchases.push(...plannedCategoryPurchases);

    //   const impulseCategoryPurchases = await prisma.purchase.findMany({
    //     orderBy: { id: "asc" },
    //     where: { logbookEntryId: logbookEntryId, category: "impulse" },
    //   });
    //   impulsePurchases.push(...impulseCategoryPurchases);
    // }

    const needPurchases = await Services.fetchLogbookEntryPurchasesByCategory(
      request.body.logbookEntryIds,
      "need"
    );

    const plannedPurchases =
      await Services.fetchLogbookEntryPurchasesByCategory(
        request.body.logbookEntryIds,
        "planned"
      );

    const impulsePurchases =
      await Services.fetchLogbookEntryPurchasesByCategory(
        request.body.logbookEntryIds,
        "impulse"
      );

    return response.status(HttpStatusCodes.OK).json({
      data: {
        needPurchases,
        plannedPurchases,
        impulsePurchases,
      },
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbooks", true),
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
  request: Request<{}, {}, Validators.PurchaseValidator>,
  response: Response
) {
  try {
    const createData: Validators.PurchaseValidator = {
      category: request.body.category,
      description: request.body.description,
      cost: request.body.cost,
      overviewGroupId: request.body.overviewGroupId,
      logbookEntryId: request.body.logbookEntryId,
    };

    if (request.body.overviewGroupId) {
      return Services.createOverviewGroupPurchase(
        request.body.overviewGroupId,
        createData,
        response
      );
    } else if (request.body.logbookEntryId) {
      return Services.createLogbookEntryPurchase(
        request.body.logbookEntryId,
        createData,
        response
      );
    } else {
      const newPurchase = await prisma.purchase.create({ data: createData });
      return HttpHelpers.respondWithSuccess(response, "created", {
        body: HttpHelpers.generateCudMessage("create", "purchase"),
        data: newPurchase,
      });
    }
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
  request: Request<{}, {}, { purchasesData: Validators.PurchaseValidator[] }>,
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
  request: Request<{ purchaseId: string }, {}, Validators.PurchaseValidator>,
  response: Response
) {
  try {
    const updateData: Validators.PurchaseValidator = {
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

    if (updatedPurchase.overviewGroupId) {
      Services.handleOverviewGroupNewTotalSpent(
        updatedPurchase.overviewGroupId,
        updatedPurchase,
        response
      );
    } else if (updatedPurchase.logbookEntryId) {
      Services.handleLogbookEntryNewTotalSpent(
        updatedPurchase.logbookEntryId,
        updatedPurchase,
        response
      );
    } else {
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("update", "purchase"),
        data: { updatedPurchase },
      });
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE PURCHASE PLACEMENT ] =========================================================== //
// ========================================================================================= //

export async function updatePurchasePlacement(
  request: Request<
    { purchaseId: string },
    {},
    { updatedPurchaseIds: number[] }
  >,
  response: Response
) {
  try {
    await Services.updatePurchasePlacements(request.body.updatedPurchaseIds);

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "purchase"),
    });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      {
        body: "Failed to update placements of purchases.",
      }
    );
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
    const purchase = await prisma.purchase.delete({
      where: { id: Number(request.params.purchaseId) },
    });

    if (purchase.overviewGroupId) {
      const updatedOverviewGroup = await Services.updateOverviewGroupTotalSpent(
        purchase.overviewGroupId,
        purchase.cost
      );
      Services.updateOverviewGroupPurchasePlacements(purchase.overviewGroupId);
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "purchase"),
        data: { updatedOverviewGroup },
      });
    } else if (purchase.logbookEntryId) {
      const updatedLogbookEntry = await Services.updateLogbookEntryTotalSpent(
        purchase.logbookEntryId,
        purchase.cost,
        purchase.category
      );
      Services.updateLogbookEntryPurchasePlacements(purchase.logbookEntryId);
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "purchase"),
        data: { updatedLogbookEntry },
      });
    } else {
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "purchase"),
      });
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ BULK DELETE ] ========================================================================= //
// ========================================================================================= //

export async function bulkDeletePurchases(
  request: Request<
    {},
    {},
    { purchaseIds: number[]; overviewGroupId?: number; logbookEntryId?: number }
  >,
  response: Response
) {
  try {
    if (request.body.overviewGroupId) {
      Services.purchaseDeleteWithOverviewGroup(
        request.body.overviewGroupId,
        request.body.purchaseIds,
        response
      );
    } else if (request.body.logbookEntryId) {
      Services.purchaseDeleteWithLogbookEntry(
        request.body.logbookEntryId,
        request.body.purchaseIds,
        response
      );
    } else {
      await prisma.purchase.deleteMany({
        where: { id: { in: request.body.purchaseIds } },
      });
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
      });
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "One or more of the selected purchases already don't exist. Please refresh the page and try again.",
    });
  }
}

// ========================================================================================= //
// [ DELETE ALL ] ========================================================================== //
// ========================================================================================= //

export async function deleteAssociatedPurchases(
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
