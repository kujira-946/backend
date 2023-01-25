import { PrismaClient } from "@prisma/client";
import { NextFunction, Response } from "express";
import bcrypt from "bcrypt";

import * as HttpHelpers from "../helpers/http.helpers";
import { RequestWithUserPasswords } from "../types/users.types";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKS IF `oldPassword` SENT FROM CLIENT MATCHES THE ONE STORED IN THE DATABASE ] ===== //
// ========================================================================================= //

export async function checkOldPasswordMatch(
  request: RequestWithUserPasswords,
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
