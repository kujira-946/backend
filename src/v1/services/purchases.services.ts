import { Response } from "express";
import { Category, PrismaClient, Purchase } from "@prisma/client";

import * as Validators from "../validators/purchases.validators";
import * as HttpHelpers from "../helpers/http.helpers";

const prisma = new PrismaClient();

export async function fetchLogbookEntryPurchasesByCategory(
  logbookEntryIds: number[],
  category: Category
) {
  let categoryPurchases: Purchase[] = [];

  for (const logbookEntryId of logbookEntryIds) {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
      where: { logbookEntryId, category },
    });

    categoryPurchases = [...categoryPurchases, ...purchases];
  }

  return categoryPurchases;
}

export async function createOverviewGroupPurchase(
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

export async function createLogbookEntryPurchase(
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

export async function handleOverviewGroupNewTotalSpent(
  overviewGroupId: number,
  updatedPurchase: Purchase,
  response: Response
) {
  const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
    where: { id: overviewGroupId },
    include: { purchases: true },
  });
  let newAssociatedTotalSpent = 0;

  for (const purchase of overviewGroup.purchases) {
    if (purchase.cost) newAssociatedTotalSpent += purchase.cost;
  }

  return HttpHelpers.respondWithSuccess(response, "ok", {
    body: HttpHelpers.generateCudMessage("update", "purchase"),
    data: { updatedPurchase, newAssociatedTotalSpent },
  });
}

export async function handleLogbookEntryNewTotalSpent(
  logbookEntryId: number,
  updatedPurchase: Purchase,
  response: Response
) {
  const logbookEntry = await prisma.logbookEntry.findUniqueOrThrow({
    where: { id: logbookEntryId },
    include: { purchases: true },
  });

  let newAssociatedTotalSpent = 0;

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

  return HttpHelpers.respondWithSuccess(response, "ok", {
    body: HttpHelpers.generateCudMessage("update", "purchase"),
    data: { updatedPurchase, newAssociatedTotalSpent },
  });
}

export async function updatePurchasePlacements(updatedPurchaseIds: number[]) {
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

export async function updateOverviewGroupPurchasePlacements(
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

export async function updateLogbookEntryPurchasePlacements(
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

function _calculateAssociatedTotalSpent(
  oldTotalSpent: number,
  purchaseCost: number
) {
  const newTotalSpent = oldTotalSpent - purchaseCost;
  if (newTotalSpent < 0) return 0;
  else return newTotalSpent;
}

export async function updateOverviewGroupTotalSpent(
  overviewGroupId: number,
  purchaseCost: number | null
) {
  const overviewGroup = await prisma.overviewGroup.findUniqueOrThrow({
    where: { id: overviewGroupId },
  });

  if (purchaseCost) {
    const newAssociatedTotalSpent = _calculateAssociatedTotalSpent(
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

export async function updateLogbookEntryTotalSpent(
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
    const newAssociatedTotalSpent = _calculateAssociatedTotalSpent(
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

async function _updateOverviewGroupTotalSpentBeforeBulkDelete(
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

async function _updateOverviewGroupPurchasePlacementAfterBulkDelete(
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

export async function purchaseDeleteWithOverviewGroup(
  overviewGroupId: number,
  purchaseIds: number[],
  response: Response
) {
  const updatedOverviewGroup =
    await _updateOverviewGroupTotalSpentBeforeBulkDelete(
      overviewGroupId,
      purchaseIds
    );

  await prisma.purchase.deleteMany({
    where: { id: { in: purchaseIds } },
  });

  await _updateOverviewGroupPurchasePlacementAfterBulkDelete(overviewGroupId);

  return HttpHelpers.respondWithSuccess(response, "ok", {
    body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
    data: { updatedOverviewGroup },
  });
}

async function _updateLogbookEntryTotalSpentBeforeBulkDelete(
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

async function _updateLogbookEntryPurchasePlacementAfterBulkDelete(
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

export async function purchaseDeleteWithLogbookEntry(
  logbookEntryId: number,
  purchaseIds: number[],
  response: Response
) {
  const updatedLogbookEntry =
    await _updateLogbookEntryTotalSpentBeforeBulkDelete(
      logbookEntryId,
      purchaseIds
    );

  await prisma.purchase.deleteMany({
    where: { id: { in: purchaseIds } },
  });

  await _updateLogbookEntryPurchasePlacementAfterBulkDelete(logbookEntryId);

  return HttpHelpers.respondWithSuccess(response, "ok", {
    body: HttpHelpers.generateCudMessage("delete", "selected purchases"),
    data: { updatedLogbookEntry },
  });
}
