import express from "express";

import * as Validators from "../validators/tasks.validators";
import * as Controllers from "../controllers/tasks.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const tasksRouter_v1 = express.Router();

tasksRouter_v1.get("/", Controllers.fetchTasks);

tasksRouter_v1.get("/:taskId", Controllers.fetchTask);

type TaskCreateData = (keyof Validators.TaskCreateValidator)[];
const taskCreateData: TaskCreateData = ["description"];
const taskOptionalCreateData: TaskCreateData = ["milestoneId"];
tasksRouter_v1.post(
  "/:milestoneId?",
  HelperMiddlewares.checkValidityOfUserData(
    taskCreateData,
    { isHttpPost: true },
    taskOptionalCreateData
  ),
  Controllers.createTask
);

type TaskUpdateData = (keyof Validators.TaskUpdateValidator)[];
const taskUpdateData: TaskUpdateData = ["completed", "description"];
tasksRouter_v1.patch(
  "/:taskId",
  HelperMiddlewares.checkValidityOfUserData(taskUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateTask
);

tasksRouter_v1.delete("/:taskId", Controllers.deleteTask);
