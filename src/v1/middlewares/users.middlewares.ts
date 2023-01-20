import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKING IF USER INPUT `oldPassword` MATCH THE ONE STORED IN THE DATABASE ] =========== //
// ========================================================================================= //

export async function checkOldPasswordMatchMiddleware(
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
      return response
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ error: "Incorrect old password. Please try again." });
    }
  } catch (error) {
    return response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Failed to find account. Please try again." });
  }
}
