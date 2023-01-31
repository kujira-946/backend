import express from "express";

import * as Validators from "../validators/purchases.validators";
import * as Controllers from "../controllers/purchases.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const purchasesRouter_v1 = express.Router();

purchasesRouter_v1.get("/", Controllers.fetchPurchases);

purchasesRouter_v1.get("/:purchaseId", Controllers.fetchPurchase);

type PurchaseCreateInputs = (keyof Validators.PurchaseCreateValidator)[];
const purchaseCreateInputs: PurchaseCreateInputs = [
  "placement",
  "cost",
  "description",
];
purchasesRouter_v1.post(
  "/",
  HelperMiddlewares.checkValidityOfUserInput(purchaseCreateInputs),
  Controllers.createPurchase
);

type PurchaseUpdateInputs = (keyof Validators.PurchaseUpdateValidator)[];
const purchaseUpdateInputs: PurchaseUpdateInputs = [
  "placement",
  "cost",
  "description",
  "category",
];
purchasesRouter_v1.patch(
  "/:purchaseId",
  HelperMiddlewares.checkValidityOfUserInput(purchaseUpdateInputs, {
    requireAllData: false,
  }),
  Controllers.updatePurchase
);

purchasesRouter_v1.delete("/:purchaseId", Controllers.deletePurchase);
