import express from "express";

import * as Validators from "../validators/purchases.validators";
import * as Controllers from "../controllers/purchases.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const purchasesRouter_v1 = express.Router();

purchasesRouter_v1.get("/", Controllers.fetchPurchases);

purchasesRouter_v1.post(
  "/fetch-overview-group-purchases",
  HelperMiddlewares.validateUserData(["overviewGroupId"]),
  Controllers.fetchOverviewGroupPurchases
);

purchasesRouter_v1.post(
  "/fetch-logbook-entry-purchases",
  HelperMiddlewares.validateUserData(["logbookEntryId"]),
  Controllers.fetchLogbookEntryPurchases
);

purchasesRouter_v1.post(
  "/fetch-logbook-entry-purchases-by-category",
  HelperMiddlewares.validateUserData(["logbookEntryIds"]),
  Controllers.fetchLogbookEntryPurchasesByCategory
);

purchasesRouter_v1.post(
  "/bulk-fetch",
  HelperMiddlewares.validateUserData(["purchaseIds"]),
  Controllers.bulkFetchPurchases
);

purchasesRouter_v1.get("/:purchaseId", Controllers.fetchPurchase);

type CreateData = (keyof Validators.PurchaseValidator)[];
const optionalCreateData: CreateData = [
  "category",
  "description",
  "cost",
  "overviewGroupId",
  "logbookEntryId",
];
purchasesRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    [],
    { isHttpPost: true },
    optionalCreateData
  ),
  Controllers.createPurchase
);

purchasesRouter_v1.post(
  "/bulk-create-purchases",
  HelperMiddlewares.validateUserData(["purchasesData"], { isHttpPost: true }),
  Controllers.bulkCreatePurchases
);

purchasesRouter_v1.patch(
  "/:purchaseId/update-purchase-placement",
  HelperMiddlewares.validateUserData(["updatedPurchaseIds"]),
  Controllers.updatePurchasePlacement
);

type UpdateData = (keyof Validators.PurchaseValidator)[];
const updateData: UpdateData = [
  "placement",
  "category",
  "description",
  "cost",
  "overviewGroupId",
  "logbookEntryId",
];
purchasesRouter_v1.patch(
  "/:purchaseId",
  HelperMiddlewares.validateUserData(updateData, {
    isHttpPost: false,
  }),
  Controllers.updatePurchase
);

purchasesRouter_v1.delete("/:purchaseId", Controllers.deletePurchase);

type BulkDeleteData = (keyof Validators.PurchaseValidator)[];
const optionalBulkDeleteData: BulkDeleteData = [
  "overviewGroupId",
  "logbookEntryId",
];
purchasesRouter_v1.post(
  "/bulk-delete",
  HelperMiddlewares.validateUserData(
    ["purchaseIds"],
    { isHttpPost: true },
    optionalBulkDeleteData
  ),
  Controllers.bulkDeletePurchases
);

purchasesRouter_v1.post(
  "/delete-associated-purchases",
  HelperMiddlewares.validateUserData([], { isHttpPost: true }, [
    "overviewGroupId",
    "logbookEntryId",
  ]),
  Controllers.deleteAssociatedPurchases
);
