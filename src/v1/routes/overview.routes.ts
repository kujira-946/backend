import express from "express";

import * as Types from "../types/overviews.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/overviews.controllers";

export const overviewRouter_v1 = express.Router();

overviewRouter_v1.get("/", Controllers.fetchOverviews);

overviewRouter_v1.get("/:overviewId", Controllers.fetchOverview);

type OverviewCreateDataFields = (keyof Types.OverviewUpdateData)[];
const overviewCreateDataFields: OverviewCreateDataFields = ["savings"];
overviewRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(overviewCreateDataFields),
  Controllers.createOverview
);

type OverviewUpdateDataFields = (keyof Types.OverviewUpdateData)[];
const overviewUpdateDataFields: OverviewUpdateDataFields = [
  "income",
  "savings",
];
overviewRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.checkValidityOfUserInput(overviewUpdateDataFields, {
    requireAllData: false,
  })
);

overviewRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
