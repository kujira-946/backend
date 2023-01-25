import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import * as HttpHelpers from "../helpers/http.helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF `oldPassword` SENT FROM CLIENT MATCHES THE ONE STORED IN THE DATABASE ] ===== //
// ========================================================================================= //

export async function checkOldPasswordMatch(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const userWithOldPassword = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    const oldPasswordsMatch = bcrypt.compareSync(
      request.body.oldPassword,
      userWithOldPassword.password
    );

    if (oldPasswordsMatch) {
      return next();
    } else {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: "Incorrect old password. Please try again.",
      });
    }
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Failed to find account. Please try again.",
    });
  }
}
