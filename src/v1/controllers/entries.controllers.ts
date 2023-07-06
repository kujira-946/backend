import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Validators from "../validators/entries.validators";
import * as HttpHelpers from "../helpers/http.helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CREATE AN ENTRY ] ===================================================================== //
// ========================================================================================= //

export async function createEntry(
  request: Request<{}, {}, Validators.EntryCreateValidator>,
  response: Response
) {
  try {
    const createData: Validators.EntryCreateValidator = {
      name: request.body.name,
      overviewId: request.body.overviewId,
      logbookId: request.body.logbookId,
    };

    const newEntry = await prisma.entry.create({
      data: createData,
    });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "entry"),
      data: newEntry,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("create", "entry", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE AN ENTRY ] ===================================================================== //
// ========================================================================================= //

export async function updateEntry(
  request: Request<{ entryId: string }, {}, Validators.EntryUpdateValidator>,
  response: Response
) {
  try {
    const updateData: Validators.EntryUpdateValidator = {
      name: request.body.name,
      totalSpent: request.body.totalSpent,
      budget: request.body.budget,
    };

    const updatedEntry = await prisma.entry.update({
      where: { id: Number(request.params.entryId) },
      data: updateData,
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "entry"),
      data: updatedEntry,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "entry", true),
    });
  }
}
