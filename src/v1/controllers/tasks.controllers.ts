import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/tasks.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL TASKS ] ===================================================================== //
// ========================================================================================= //

export async function fetchTasks(_: Request, response: Response) {
  try {
    const tasks: Validators.TaskRelationsValidator[] =
      await prisma.task.findMany({
        orderBy: { id: "asc" },
        include: { milestone: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: tasks });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("tasks") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE TASK ] ====================================================================== //
// ========================================================================================= //

export async function fetchTask(
  request: Request<{ taskId: string }>,
  response: Response
) {
  try {
    const task: Validators.TaskRelationsValidator =
      await prisma.task.findUniqueOrThrow({
        where: { id: Number(request.params.taskId) },
        include: { milestone: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: task });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("task", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A TASK ] ======================================================================= //
// ========================================================================================= //

export async function createTask(
  request: Request<
    { milestoneId?: string },
    {},
    Validators.TaskCreateValidator
  >,
  response: Response
) {
  try {
    const createData: Validators.TaskCreateValidator = {
      description: request.body.description,
    };
    if (request.params.milestoneId) {
      createData["milestoneId"] = Number(request.params.milestoneId);
    }

    const newTask: Validators.TaskRelationsValidator = await prisma.task.create(
      {
        data: createData,
        include: { milestone: true },
      }
    );

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "task"),
      data: newTask,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "task", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A TASK ] ======================================================================= //
// ========================================================================================= //

export async function updateTask(
  request: Request<{ taskId: string }, {}, Validators.TaskUpdateValidator>,
  response: Response
) {
  try {
    const updateData: Validators.TaskUpdateValidator = {
      completed: request.body.completed,
      description: request.body.description,
    };

    const updatedTask: Validators.TaskRelationsValidator =
      await prisma.task.update({
        where: { id: Number(request.params.taskId) },
        data: updateData,
        include: { milestone: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "task"),
      data: updatedTask,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "task", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A TASK ] ======================================================================= //
// ========================================================================================= //

export async function deleteTask(
  request: Request<{ taskId: string }>,
  response: Response
) {
  try {
    await prisma.task.delete({
      where: { id: Number(request.params.taskId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "task"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "task", true),
    });
  }
}
