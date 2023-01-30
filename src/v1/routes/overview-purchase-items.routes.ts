import express from "express";

import * as Types from "../types/overview-purchase-items.types";
import * as Controllers from "../controllers/overview-purchase-items.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewPurchaseItemsRouter_v1 = express.Router();

overviewPurchaseItemsRouter_v1.get("/", Controllers.fetchOverviewPurchaseItems);

overviewPurchaseItemsRouter_v1.get(
  "/:itemId",
  Controllers.fetchOverviewPurchaseItem
);

type OverviewPurchaseItemDataFields =
  (keyof Types.OverviewPurchaseItemsUpdateData)[];
const overviewPurchaseItemDataFields: OverviewPurchaseItemDataFields = [
  "description",
  "cost",
];

overviewPurchaseItemsRouter_v1.post(
  "/",
  HelperMiddlewares.checkValidityOfUserInput(overviewPurchaseItemDataFields),
  Controllers.createOverviewPurchaseItem
);

overviewPurchaseItemsRouter_v1.patch(
  "/:itemId",
  HelperMiddlewares.checkValidityOfUserInput(overviewPurchaseItemDataFields, {
    requireAllData: false,
  }),
  Controllers.updateOverviewPurchaseItem
);

overviewPurchaseItemsRouter_v1.delete(
  "/:itemId",
  Controllers.deleteOverviewPurchaseItem
);
