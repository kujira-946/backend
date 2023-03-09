import express from "express";

import * as Validators from "../validators/purchases.validators";
import * as Controllers from "../controllers/purchases.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const purchasesRouter_v1 = express.Router();

purchasesRouter_v1.get("/", Controllers.fetchPurchases);

purchasesRouter_v1.get("/:purchaseId", Controllers.fetchPurchase);

type PurchaseCreateData = (keyof Validators.PurchaseCreateValidator)[];
const purchaseCreateData: PurchaseCreateData = ["placement"];
const purchaseOptionalCreateData: PurchaseCreateData = [
  "category",
  "description",
  "cost",
  "overviewGroupId",
  "logbookEntryId",
];
purchasesRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    purchaseCreateData,
    { isHttpPost: true },
    purchaseOptionalCreateData
  ),
  Controllers.createPurchase
);

type PurchaseUpdateData = (keyof Validators.PurchaseUpdateValidator)[];
const purchaseUpdateData: PurchaseUpdateData = [
  "placement",
  "category",
  "description",
  "cost",
  "overviewGroupId",
  "logbookEntryId",
];
purchasesRouter_v1.patch(
  "/:purchaseId",
  HelperMiddlewares.validateUserData(purchaseUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updatePurchase
);

purchasesRouter_v1.delete("/:purchaseId", Controllers.deletePurchase);
