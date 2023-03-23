import express from "express";

import * as Validators from "../validators/overview-groups.validators";
import * as Controllers from "../controllers/overview-groups.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewGroupsRouter_v1 = express.Router();

overviewGroupsRouter_v1.get("/", Controllers.fetchOverviewGroups);

overviewGroupsRouter_v1.get(
  "/fetch-overview-groups",
  HelperMiddlewares.validateUserData(["overviewId"]),
  Controllers.fetchOverviewOverviewGroups
);

overviewGroupsRouter_v1.get(
  "/bulk-fetch",
  HelperMiddlewares.validateUserData(["overviewGroupIds"]),
  Controllers.bulkFetchOverviewGroups
);

overviewGroupsRouter_v1.get(
  "/:overviewGroupId",
  Controllers.fetchOverviewGroup
);

type CreateData = (keyof Validators.OverviewGroupCreateValidator)[];
const createData: CreateData = ["name", "overviewId"];
const optionalCreateData: CreateData = ["totalCost"];
overviewGroupsRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    createData,
    { isHttpPost: true },
    optionalCreateData
  ),
  Controllers.createOverviewGroup
);

type UpdateData = (keyof Validators.OverviewGroupUpdateValidator)[];
const updateData: UpdateData = ["name", "totalCost", "overviewId"];
overviewGroupsRouter_v1.patch(
  "/:overviewGroupId",
  HelperMiddlewares.validateUserData(updateData, {
    isHttpPost: false,
  }),
  Controllers.updateOverviewGroup
);

overviewGroupsRouter_v1.delete(
  "/:overviewGroupId",
  Controllers.deleteOverviewGroup
);
