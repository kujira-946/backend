import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Validators from "../validators/logbook-review.validators";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL LOGBOOK REVIEWS ] ============================================================== //
// ========================================================================================= //

export async function fetchLogbookReviews(_: Request, response: Response) {
  try {
    const logbookReviews: Validators.LogbookReviewRelationsValidator[] =
      await prisma.logbookReview.findMany({
        orderBy: { id: "asc" },
        include: {
          needs: true,
          plannedWants: true,
          impulsiveWants: true,
          regrets: true,
        },
      });
    return response.status(HttpStatusCodes.OK).json({ data: logbookReviews });
  } catch (error) {
    return HttpHelpers.respondWithServerError(
      response,
      "internal server error",
      { body: HttpHelpers.generateFetchError("logbook reviews") }
    );
  }
}

// ========================================================================================= //
// [ FETCH ONE LOGBOOK REVIEW ] ============================================================== //
// ========================================================================================= //

export async function fetchLogbookReview(
  request: Request<{ logbookReviewId: string }>,
  response: Response
) {
  try {
    const logbookReview: Validators.LogbookReviewRelationsValidator =
      await prisma.logbookReview.findUniqueOrThrow({
        where: { id: Number(request.params.logbookReviewId) },
        include: {
          needs: true,
          plannedWants: true,
          impulsiveWants: true,
          regrets: true,
        },
      });
    return response.status(HttpStatusCodes.OK).json({ data: logbookReview });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("logbook review", false),
    });
  }
}

// ========================================================================================= //
// [ CREATE A LOGBOOK REVIEW ] ============================================================== //
// ========================================================================================= //

export async function createLogbookReview(
  request: Request<{ ownerId: string }, {}, { reflection?: string }>,
  response: Response
) {
  try {
    const createData: Validators.LogbookReviewCreateValidator = {
      ownerId: Number(request.params.ownerId),
      reflection: request.body.reflection,
    };

    const newLogbookReview: Validators.LogbookReviewRelationsValidator =
      await prisma.logbookReview.create({
        data: createData,
        include: {
          needs: true,
          plannedWants: true,
          impulsiveWants: true,
          regrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "logbook review"),
      data: newLogbookReview,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "logbook review", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A LOGBOOK REVIEW ] ============================================================== //
// ========================================================================================= //

export async function updateLogbookReview(
  request: Request<{ logbookReviewId: string }, {}, { reflection?: string }>,
  response: Response
) {
  try {
    const updateData: Validators.LogbookReviewUpdateValidator = {
      reflection: request.body.reflection,
    };

    const updatedLogbookReview: Validators.LogbookReviewRelationsValidator =
      await prisma.logbookReview.update({
        where: { id: Number(request.params.logbookReviewId) },
        data: updateData,
        include: {
          needs: true,
          plannedWants: true,
          impulsiveWants: true,
          regrets: true,
        },
      });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "logbook review"),
      data: updatedLogbookReview,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "logbook review", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A LOGBOOK REVIEW ] ============================================================== //
// ========================================================================================= //

export async function deleteLogbookReview(
  request: Request<{ logbookReviewId: string }>,
  response: Response
) {
  try {
    await prisma.logbookReview.delete({
      where: { id: Number(request.params.logbookReviewId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "logbook review"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "logbook review", true),
    });
  }
}
