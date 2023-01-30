import { overviewPurchaseItemsRouter_v1 } from "./overview-purchase-items.routes";
import express from "express";

import * as Types from "../types/logbook-group-purchase-items.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/logbook-group-purchase-items.controllers";

export const logbookGroupPurchaseItemRouter_v1 = express.Router();

overviewPurchaseItemsRouter_v1.get(
  "/",
  Controllers.fetchLogbookGroupPurchaseItems
);

overviewPurchaseItemsRouter_v1.get(
  "/:itemId",
  Controllers.fetchLogbookGroupPurchaseItem
);

type LogbookGroupPurchaseItemsCreateDataFields =
  (keyof Types.LogbookGroupPurchaseItemsWithRelations)[];
const logbookGroupPurchaseItemsCreateDataFields: LogbookGroupPurchaseItemsCreateDataFields =
  ["placement", "cost", "category", "description"];

overviewPurchaseItemsRouter_v1.post(
  "/:logbookGroupId",
  HelperMiddlewares.checkValidityOfUserInput(
    logbookGroupPurchaseItemsCreateDataFields
  ),
  Controllers.createLogbookGroupPurchaseItem
);

type LogbookGroupPurchaseItemsUpdateDataFields =
  (keyof Types.LogbookGroupPurchaseItemsWithRelations)[];
const logbookGroupPurchaseItemsUpdateDataFields: LogbookGroupPurchaseItemsUpdateDataFields =
  ["cost", "category", "description"];

overviewPurchaseItemsRouter_v1.patch(
  "/:itemId",
  HelperMiddlewares.checkValidityOfUserInput(
    logbookGroupPurchaseItemsUpdateDataFields,
    { requireAllData: false }
  ),
  Controllers.updateLogbookGroupPurchaseItem
);

type LogbookGroupPurchaseItemsPlacementUpdateDataFields =
  (keyof Types.LogbookGroupPurchaseItemsWithRelations)[];
const logbookGroupPurchaseItemsPlacementUpdateDataFields: LogbookGroupPurchaseItemsPlacementUpdateDataFields =
  ["placement"];

overviewPurchaseItemsRouter_v1.patch(
  "/:itemId",
  HelperMiddlewares.checkValidityOfUserInput(
    logbookGroupPurchaseItemsPlacementUpdateDataFields
  ),
  Controllers.updateLogbookGroupPurchaseItemPlacement
);

overviewPurchaseItemsRouter_v1.delete(
  "/:itemId",
  Controllers.deleteLogbookGroupPurchaseItem
);
