import { PrismaClient, Purchase } from "@prisma/client";
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
// [ FETCH OVERVIEW GROUP PURCHASES ] ====================================================== //
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
// [ FETCH LOGBOOK ENTRY PURCHASES ] ======================================================= //
// ========================================================================================= //

export async function fetchLogbookEntryPurchases(
  request: Request<{}, {}, { logbookEntryId: number }>,
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
    const needPurchases: Purchase[] = [];
    const plannedPurchases: Purchase[] = [];
    const impulsePurchases: Purchase[] = [];

    for (const logbookEntryId of request.body.logbookEntryIds) {
      const needCategoryPurchases = await prisma.purchase.findMany({
        orderBy: { id: "asc" },
        where: { logbookEntryId: logbookEntryId, category: "need" },
      });
      needPurchases.push(...needCategoryPurchases);

      const plannedCategoryPurchases = await prisma.purchase.findMany({
        orderBy: { id: "asc" },
        where: { logbookEntryId: logbookEntryId, category: "planned" },
      });
      plannedPurchases.push(...plannedCategoryPurchases);

      const impulseCategoryPurchases = await prisma.purchase.findMany({
        orderBy: { id: "asc" },
        where: { logbookEntryId: logbookEntryId, category: "impulse" },
      });
      impulsePurchases.push(...impulseCategoryPurchases);
    }

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

async function createOverviewGroupPurchase(
  overviewGroupId: number,
  createData: Validators.PurchaseValidator,
  response: Response
) {
  const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
    where: { id: overviewGroupId },
    include: { purchases: true },
  });
  const newPurchase = await prisma.purchase.create({
    data: { placement: overviewGroup.purchases.length + 1, ...createData },
  });
  return HttpHelpers.respondWithSuccess(response, "created", {
    body: HttpHelpers.generateCudMessage("create", "overview group purchase"),
    data: newPurchase,
  });
}

async function createLogbookEntryPurchase(
  logbookEntryId: number,
  createData: Validators.PurchaseValidator,
  response: Response
) {
  const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
    where: { id: logbookEntryId },
    include: { purchases: true },
  });

  const newPurchase = await prisma.purchase.create({
    data: { placement: logbookEntry.purchases.length + 1, ...createData },
  });
  return HttpHelpers.respondWithSuccess(response, "created", {
    body: HttpHelpers.generateCudMessage("create", "logbook entry purchase"),
    data: newPurchase,
  });
}

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
      return createOverviewGroupPurchase(
        request.body.overviewGroupId,
        createData,
        response
      );
    } else if (request.body.logbookEntryId) {
      return createLogbookEntryPurchase(
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
// [ UPDATE PURCHASE PLACEMENT ] =========================================================== //
// ========================================================================================= //

async function updateOverviewGroupPurchasePlacement(overviewGroupId: number) {
  try {
    const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
      where: { id: overviewGroupId },
      include: { purchases: true },
    });
    await prisma.$transaction(async () => {
      overviewGroup.purchases.forEach(
        async (purchase: Purchase, index: number) => {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { placement: index + 1 },
          });
        }
      );
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function updateLogbookEntryPurchasePlacement(logbookEntryId: number) {
  try {
    const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
      where: { id: logbookEntryId },
      include: { purchases: true },
    });

    await prisma.$transaction(async () => {
      logbookEntry.purchases.forEach(
        async (purchase: Purchase, index: number) => {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { placement: index + 1 },
          });
        }
      );
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

export async function updatePurchasePlacement(
  request: Request<{ purchaseId: string }, {}, { updatedPlacement: number }>,
  response: Response
) {
  try {
    const updatedPurchase = await prisma.purchase.update({
      where: { id: Number(request.params.purchaseId) },
      data: { placement: request.body.updatedPlacement },
    });

    if (updatedPurchase.overviewGroupId) {
      updateOverviewGroupPurchasePlacement(updatedPurchase.overviewGroupId);
    } else if (updatedPurchase.logbookEntryId) {
      updateLogbookEntryPurchasePlacement(updatedPurchase.logbookEntryId);
    }

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "purchase"),
      data: updatedPurchase,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "purchase", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A PURCHASE ] =================================================================== //
// ========================================================================================= //

async function updateOverviewGroupPurchasePlacementAfterDelete(
  overviewGroupId: number,
  deletePurchasePlacement: number
) {
  try {
    const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
      where: { id: overviewGroupId },
      include: { purchases: true },
    });

    await prisma.$transaction(async () => {
      overviewGroup.purchases.forEach(async (purchase: Purchase) => {
        if (
          purchase.placement &&
          purchase.placement > deletePurchasePlacement
        ) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { placement: purchase.placement - 1 },
          });
        }
      });
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function updateLogbookEntryPurchasePlacementAfterDelete(
  logbookEntryId: number,
  deletePurchasePlacement: number
) {
  try {
    const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
      where: { id: logbookEntryId },
      include: { purchases: true },
    });

    await prisma.$transaction(async () => {
      logbookEntry.purchases.forEach(async (purchase: Purchase) => {
        if (
          purchase.placement &&
          purchase.placement > deletePurchasePlacement
        ) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { placement: purchase.placement - 1 },
          });
        }
      });
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function updateAssociatedTotalSpent(
  purchase: Purchase,
  response: Response
) {
  try {
    if (purchase.category !== "monthly" && purchase.cost) {
      // Update associated overview group's `totalCost`.
      if (purchase.overviewGroupId) {
        const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
          where: { id: purchase.overviewGroupId },
        });
        const updatedTotalSpent = overviewGroup.totalSpent - purchase.cost;

        await prisma.overviewGroup.update({
          where: { id: overviewGroup.id },
          data: { totalSpent: updatedTotalSpent < 0 ? 0 : updatedTotalSpent },
        });
      }
      // Update associated logbook entry's `totalCost`.
      else if (purchase.logbookEntryId) {
        const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
          where: { id: purchase.logbookEntryId },
        });
        const updatedTotalSpent = logbookEntry.totalSpent - purchase.cost;

        await prisma.logbookEntry.update({
          where: { id: logbookEntry.id },
          data: { totalSpent: updatedTotalSpent < 0 ? 0 : updatedTotalSpent },
        });
      }
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError(
        purchase.overviewGroupId
          ? "associated overview group"
          : "associated logbook entry",
        false
      ),
    });
  }
}

export async function deletePurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  try {
    const purchase = await prisma.purchase.delete({
      where: { id: Number(request.params.purchaseId) },
    });

    // If the deleted purchase belongs to an overview group or logbook entry,
    // the function below updates the association's `totalSpent` field.
    await updateAssociatedTotalSpent(purchase, response);

    if (purchase.overviewGroupId && purchase.placement) {
      updateOverviewGroupPurchasePlacementAfterDelete(
        purchase.overviewGroupId,
        purchase.placement
      );
    } else if (purchase.logbookEntryId && purchase.placement) {
      updateLogbookEntryPurchasePlacementAfterDelete(
        purchase.logbookEntryId,
        purchase.placement
      );
    }

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
// [ BULK DELETE ] ========================================================================= //
// ========================================================================================= //

async function updateOverviewGroupPurchasePlacementAfterBulkDelete(
  overviewGroupId: number
) {
  const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
    where: { id: overviewGroupId },
    include: { purchases: true },
  });
  overviewGroup.purchases.forEach(async (purchase: Purchase, index: number) => {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { placement: index + 1 },
    });
  });
}

async function updateLogbookEntryPurchasePlacementAfterBulkDelete(
  logbookEntryId: number
) {
  const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
    where: { id: logbookEntryId },
    include: { purchases: true },
  });
  logbookEntry.purchases.forEach(async (purchase: Purchase, index: number) => {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { placement: index + 1 },
    });
  });
}

export async function bulkDeletePurchases(
  request: Request<
    {},
    {},
    { purchaseIds: number[]; overviewGroupId?: number; logbookEntryId?: number }
  >,
  response: Response
) {
  try {
    await prisma.purchase.deleteMany({
      where: { id: { in: request.body.purchaseIds } },
    });

    if (request.body.overviewGroupId) {
      updateOverviewGroupPurchasePlacementAfterBulkDelete(
        request.body.overviewGroupId
      );
    } else if (request.body.logbookEntryId) {
      updateLogbookEntryPurchasePlacementAfterBulkDelete(
        request.body.logbookEntryId
      );
    }

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
