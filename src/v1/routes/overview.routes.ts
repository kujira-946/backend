import express from "express";

import * as Types from "../types/overviews.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/overviews.controllers";

export const overviewRouter_v1 = express.Router();

overviewRouter_v1.get("/", Controllers.fetchOverviews);

overviewRouter_v1.get("/:overviewId", Controllers.fetchOverview);

overviewRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(["savings"]),
  Controllers.createOverview
);

type OverviewDataFields = (keyof Types.OverviewUpdateData)[];
const overviewDataFields: OverviewDataFields = ["income", "savings"];

overviewRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.checkValidityOfUserInput(overviewDataFields, {
    requireAllData: false,
  })
);

overviewRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
