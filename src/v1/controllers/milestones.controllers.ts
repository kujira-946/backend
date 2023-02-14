import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Validators from "../validators/milestones.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "./../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL MILESTONES ] ================================================================ //
// ========================================================================================= //

export async function fetchMilestones(_: Request, response: Response) {
  try {
    const milestone: Validators.MilestoneRelationsValidator[] =
      await prisma.milestone.findMany({
        orderBy: { id: "asc" },
        include: { tasks: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: milestone });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("milestone") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE MILESTONE ] ================================================================= //
// ========================================================================================= //

export async function fetchMilestone(
  request: Request<{ milestoneId: string }>,
  response: Response
) {
  try {
    const milestone: Validators.MilestoneRelationsValidator =
      await prisma.milestone.findUniqueOrThrow({
        where: { id: Number(request.params.milestoneId) },
        include: { tasks: true },
      });

    return response.status(HttpStatusCodes.OK).json({ data: milestone });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("milestone", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A MILESTONE ] ================================================================== //
// ========================================================================================= //

export async function createMilestone(
  request: Request<{}, {}, Validators.MilestoneCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.MilestoneCreateValidator = {
      placement: request.body.placement,
      name: request.body.name,
      reward: request.body.reward,
    };

    const newMilestone: Validators.MilestoneRelationsValidator =
      await prisma.milestone.create({
        data: createData,
        include: { tasks: true },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "milestone"),
      data: newMilestone,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "milestone", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A MILESTONE ] ================================================================== //
// ========================================================================================= //

export async function updateMilestone(
  request: Request<
    { milestoneId: string },
    {},
    Validators.MilestoneUpdateValidator
  >,
  response: Response
) {
  try {
    const updateData: Validators.MilestoneUpdateValidator = {
      placement: request.body.placement,
      achieved: request.body.achieved,
      name: request.body.name,
      reward: request.body.reward,
    };

    const updatedTask: Validators.MilestoneRelationsValidator =
      await prisma.milestone.update({
        where: { id: Number(request.params.milestoneId) },
        data: updateData,
        include: { tasks: true },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "milestone"),
      data: updatedTask,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "milestone", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A MILESTONE ] ================================================================== //
// ========================================================================================= //

export async function deleteMilestone(
  request: Request<{ milestoneId: string }>,
  response: Response
) {
  try {
    await prisma.milestone.delete({
      where: { id: Number(request.params.milestoneId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "milestone"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "milestone", true),
    });
  }
}
