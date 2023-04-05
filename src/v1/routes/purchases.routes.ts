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
  "/bulk-fetch",
  HelperMiddlewares.validateUserData(["purchaseIds"]),
  Controllers.bulkFetchPurchases
);

purchasesRouter_v1.get("/:purchaseId", Controllers.fetchPurchase);

type CreateData = (keyof Validators.PurchaseCreateValidator)[];
const createData: CreateData = ["placement"];
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
    createData,
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

type UpdateData = (keyof Validators.PurchaseUpdateValidator)[];
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

purchasesRouter_v1.post(
  "/batch-delete",
  HelperMiddlewares.validateUserData(["purchaseIds"]),
  Controllers.batchDeletePurchases
);

purchasesRouter_v1.post(
  "/delete-all",
  HelperMiddlewares.validateUserData([], { isHttpPost: true }, [
    "overviewGroupId",
    "logbookEntryId",
  ]),
  Controllers.deleteAllPurchases
);
