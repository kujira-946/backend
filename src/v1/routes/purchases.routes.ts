import express from "express";

import * as Validators from "../validators/purchases.validators";
import * as Controllers from "../controllers/purchases.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const purchasesRouter_v1 = express.Router();

purchasesRouter_v1.get("/", Controllers.fetchPurchases);

purchasesRouter_v1.get("/:purchaseId", Controllers.fetchPurchase);

type PurchaseCreateData = (keyof Validators.PurchaseCreateValidator)[];
const purchaseCreateData: PurchaseCreateData = [
  "placement",
  "cost",
  "description",
];
const purchaseCreateOptionalData: PurchaseCreateData = [
  "overviewRecurringPurchasesId",
  "overviewIncomingPurchasesId",
  "logbookDayId",
  "logbookReviewNeedsId",
  "logbookReviewPlannedWantsId",
  "logbookReviewImpulsiveWantsId",
  "logbookReviewRegretsId",
];
purchasesRouter_v1.post(
  "/",
  HelperMiddlewares.checkValidityOfUserData(
    purchaseCreateData,
    { isHttpPost: true },
    purchaseCreateOptionalData
  ),
  Controllers.createPurchase
);

type PurchaseUpdateData = (keyof Validators.PurchaseUpdateValidator)[];
const purchaseUpdateData: PurchaseUpdateData = [
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
  HelperMiddlewares.checkValidityOfUserData(purchaseUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updatePurchase
);

purchasesRouter_v1.delete("/:purchaseId", Controllers.deletePurchase);
