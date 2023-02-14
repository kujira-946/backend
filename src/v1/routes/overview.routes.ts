import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as Controllers from "../controllers/overviews.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

overviewsRouter_v1.get("/:overviewId", Controllers.fetchOverview);

type OverviewCreateData = (keyof Validators.OverviewCreateValidator)[];
const overviewCreateData: OverviewCreateData = ["income"];
const overviewOptionalCreateData: OverviewCreateData = ["savings"];
overviewsRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserData(
    overviewCreateData,
    { isHttpPost: true },
    overviewOptionalCreateData
  ),
  Controllers.createOverview
);

type OverviewUpdateData = (keyof Validators.OverviewUpdateValidator)[];
const overviewUpdateData: OverviewUpdateData = ["income", "savings", "earnedBudget"];
overviewsRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.checkValidityOfUserData(overviewUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateOverview
);

overviewsRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
