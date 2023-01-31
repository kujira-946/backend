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
  HelperMiddlewares.checkValidityOfUserData(purchaseCreateInputs),
  Controllers.createPurchase
);

type PurchaseUpdateInputs = (keyof Validators.PurchaseUpdateValidator)[];
const purchaseUpdateInputs: PurchaseUpdateInputs = [
  "placement",
  "cost",
  "description",
  "category",
  "overviewRecurringPurchasesId",
  "overviewIncomingPurchasesId",
  "logbookDayId",
  "logbookReviewNeedsId",
  "logbookReviewPlannedWantsId",
  "logbookReviewImpulsiveWantsId",
  "logbookReviewRegretsId",
];
purchasesRouter_v1.patch(
  "/:purchaseId",
  HelperMiddlewares.checkValidityOfUserData(purchaseUpdateInputs, {
    isHttpPost: false,
  }),
  Controllers.updatePurchase
);

purchasesRouter_v1.delete("/:purchaseId", Controllers.deletePurchase);
