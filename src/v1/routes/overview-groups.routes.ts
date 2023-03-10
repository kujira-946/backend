import express from "express";

import * as Validators from "../validators/overview-group.validators";
import * as Controllers from "../controllers/overview-group.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewGroupsRouter_v1 = express.Router();

overviewGroupsRouter_v1.get("/", Controllers.fetchOverviewGroups);

overviewGroupsRouter_v1.get(
  "/:overviewGroupId",
  Controllers.fetchOverviewGroup
);

type OverviewGroupCreateData =
  (keyof Validators.OverviewGroupCreateValidator)[];
const overviewGroupCreateData: OverviewGroupCreateData = ["name", "overviewId"];
const overviewGroupOptionalCreateData: OverviewGroupCreateData = ["totalCost"];
overviewGroupsRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    overviewGroupCreateData,
    { isHttpPost: true },
    overviewGroupOptionalCreateData
  ),
  Controllers.createOverviewGroup
);

type OverviewGroupUpdateData =
  (keyof Validators.OverviewGroupUpdateValidator)[];
const overviewGroupUpdateData: OverviewGroupUpdateData = [
  "name",
  "totalCost",
  "overviewId",
];
overviewGroupsRouter_v1.patch(
  "/:overviewGroupId",
  HelperMiddlewares.validateUserData(overviewGroupUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateOverviewGroup
);

overviewGroupsRouter_v1.delete(
  "/:overviewGroupId",
  Controllers.deleteOverviewGroup
);
