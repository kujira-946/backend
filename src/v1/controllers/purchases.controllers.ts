import { Category, PrismaClient, Purchase } from "@prisma/client";
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

    let newAssociatedTotalSpent = 0;

    if (updatedPurchase.overviewGroupId) {
      const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
        where: { id: updatedPurchase.overviewGroupId },
        include: { purchases: true },
      });
      for (const purchase of overviewGroup.purchases) {
        if (purchase.cost) newAssociatedTotalSpent += purchase.cost;
      }
    } else if (updatedPurchase.logbookEntryId) {
      const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
        where: { id: updatedPurchase.logbookEntryId },
        include: { purchases: true },
      });
      for (const purchase of logbookEntry.purchases) {
        if (
          purchase.cost &&
          (purchase.category === "need" ||
            purchase.category === "planned" ||
            purchase.category === "impulse")
        ) {
          newAssociatedTotalSpent += purchase.cost;
        }
      }
    }

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "purchase"),
      data: { updatedPurchase, newAssociatedTotalSpent },
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

async function handleUpdatingOfPurchasePlacements(
  updatedPurchaseIds: number[]
) {
  try {
    await prisma.$transaction(async () => {
      for (const [index, purchaseId] of updatedPurchaseIds.entries()) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: { placement: index + 1 },
        });
      }
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

export async function updatePurchasePlacement(
  request: Request<
    { purchaseId: string },
    {},
    { updatedPurchaseIds: number[] }
  >,
  response: Response
) {
  try {
    await handleUpdatingOfPurchasePlacements(request.body.updatedPurchaseIds);

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

async function updateOverviewGroupPurchasePlacementAfterDelete(
  overviewGroupId: number
) {
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

async function updateLogbookEntryPurchasePlacementAfterDelete(
  logbookEntryId: number
) {
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

// If the deleted purchase belongs to an overview group or logbook entry,
// the function below updates the association's `totalSpent` field.

function calculateAssociatedTotalSpent(
  oldTotalSpent: number,
  purchaseCost: number
) {
  const newTotalSpent = oldTotalSpent - purchaseCost;
  if (newTotalSpent < 0) return 0;
  else return newTotalSpent;
}

async function updateAssociatedOverviewGroupTotalSpent(
  overviewGroupId: number,
  purchaseCost: number | null
) {
  const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
    where: { id: overviewGroupId },
  });

  if (purchaseCost) {
    const newAssociatedTotalSpent = calculateAssociatedTotalSpent(
      overviewGroup.totalSpent,
      purchaseCost
    );

    return await prisma.overviewGroup.update({
      where: { id: overviewGroup.id },
      data: { totalSpent: newAssociatedTotalSpent },
    });
  } else {
    return overviewGroup;
  }
}

async function updateAssociatedLogbookEntryTotalSpent(
  logbookEntryId: number,
  purchaseCost: number | null,
  purchaseCategory: Category | null
) {
  const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
    where: { id: logbookEntryId },
  });

  if (
    purchaseCost &&
    (purchaseCategory === "need" ||
      purchaseCategory === "planned" ||
      purchaseCategory === "impulse")
  ) {
    const newAssociatedTotalSpent = calculateAssociatedTotalSpent(
      logbookEntry.totalSpent,
      purchaseCost
    );

    return await prisma.logbookEntry.update({
      where: { id: logbookEntry.id },
      data: { totalSpent: newAssociatedTotalSpent },
    });
  } else {
    return logbookEntry;
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

    // ↓↓↓ Update `totalSpent` and purchase placements of purchase's associated overview group. ↓↓↓ //
    if (purchase.overviewGroupId) {
      const updatedOverviewGroup =
        await updateAssociatedOverviewGroupTotalSpent(
          purchase.overviewGroupId,
          purchase.cost
        );

      updateOverviewGroupPurchasePlacementAfterDelete(purchase.overviewGroupId);

      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "purchase"),
        data: { updatedOverviewGroup },
      });
    }
    // ↓↓↓ Update `totalSpent` and purchase placements of purchase's associated logbook entry. ↓↓↓ //
    else if (purchase.logbookEntryId) {
      const updatedLogbookEntry = await updateAssociatedLogbookEntryTotalSpent(
        purchase.logbookEntryId,
        purchase.cost,
        purchase.category
      );

      updateLogbookEntryPurchasePlacementAfterDelete(purchase.logbookEntryId);

      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "purchase"),
        data: { updatedLogbookEntry },
      });
    }
    // ↓↓↓ If the purchase doesn't belong to anything. ↓↓↓ //
    else {
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

async function updateOverviewGroupTotalSpentBeforeBulkDelete(
  overviewGroupId: number,
  purchaseIds: number[]
) {
  try {
    const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
      where: { id: overviewGroupId },
    });

    let purchaseTotalCosts = 0;

    await prisma.$transaction(async () => {
      for (const purchaseId of purchaseIds) {
        const purchase = await prisma.purchase.findUniqueOrThrow({
          where: { id: purchaseId },
        });
        if (
          purchase.cost &&
          (purchase.category === "need" ||
            purchase.category === "planned" ||
            purchase.category === "impulse")
        )
          purchaseTotalCosts += purchase.cost;
      }
    });

    const updatedOverviewGroup = await prisma.overviewGroup.update({
      where: { id: overviewGroupId },
      data: { totalSpent: overviewGroup.totalSpent - purchaseTotalCosts },
    });

    await prisma.$disconnect();
    return updatedOverviewGroup;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit();
  }
}

async function updateLogbookEntryTotalSpentBeforeBulkDelete(
  logbookEntryId: number,
  purchaseIds: number[]
) {
  try {
    const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
      where: { id: logbookEntryId },
    });

    let purchaseTotalCosts = 0;

    await prisma.$transaction(async () => {
      for (const purchaseId of purchaseIds) {
        const purchase = await prisma.purchase.findUniqueOrThrow({
          where: { id: purchaseId },
        });
        if (
          purchase.cost &&
          (purchase.category === "need" ||
            purchase.category === "planned" ||
            purchase.category === "impulse")
        )
          purchaseTotalCosts += purchase.cost;
      }
    });

    const updatedLogbookEntry = await prisma.logbookEntry.update({
      where: { id: logbookEntryId },
      data: { totalSpent: logbookEntry.totalSpent - purchaseTotalCosts },
    });

    await prisma.$disconnect();
    return updatedLogbookEntry;
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit();
  }
}

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
    // ↓↓↓ If purchases belong to an overview group. ↓↓↓ //
    if (request.body.overviewGroupId) {
      const updatedOverviewGroup =
        await updateOverviewGroupTotalSpentBeforeBulkDelete(
          request.body.overviewGroupId,
          request.body.purchaseIds
        );
      await prisma.purchase.deleteMany({
        where: { id: { in: request.body.purchaseIds } },
      });
      await updateOverviewGroupPurchasePlacementAfterBulkDelete(
        request.body.overviewGroupId
      );
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
        data: { updatedOverviewGroup },
      });
    }
    // ↓↓↓ If purchases belong to a logbook entry. ↓↓↓ //
    else if (request.body.logbookEntryId) {
      const updatedLogbookEntry =
        await updateLogbookEntryTotalSpentBeforeBulkDelete(
          request.body.logbookEntryId,
          request.body.purchaseIds
        );
      await prisma.purchase.deleteMany({
        where: { id: { in: request.body.purchaseIds } },
      });
      await updateLogbookEntryPurchasePlacementAfterBulkDelete(
        request.body.logbookEntryId
      );
      return HttpHelpers.respondWithSuccess(response, "ok", {
        body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
        data: { updatedLogbookEntry },
      });
    }
    // ↓↓↓ If purchases don't belong to anything. ↓↓↓ //
    else {
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
