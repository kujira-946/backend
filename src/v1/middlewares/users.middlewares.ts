import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ CHECKING FOR INVALID FORM INPUT WHEN UPDATING A USER ] ================================ //
// ========================================================================================= //

export function checkUserCreationInvalidFormInputMiddleware(
  allowedFormFields: string[]
) {
  return function (request: Request, response: Response, next: NextFunction) {
    const invalidFormFields = [];

    const clientFormFields = Object.keys(request.body);
    for (let index = 0; index < clientFormFields.length; index++) {
      const currentClientFormField = clientFormFields[index];
      const theClientSentAnInvalidFormField = !allowedFormFields.includes(
        currentClientFormField
      );
      if (theClientSentAnInvalidFormField) {
        invalidFormFields.push(currentClientFormField);
      }
    }

    if (invalidFormFields.length > 0) {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: `Invalid form field(s): ${invalidFormFields.join(", ")}.`,
      });
    } else {
      return next();
    }
  };
}

// ========================================================================================= //
// [ CHECKING IF USER INPUT `oldPassword` MATCH THE ONE STORED IN THE DATABASE ] =========== //
// ========================================================================================= //

export async function checkOldPasswordMatchMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const userWithOldPassword = await prisma.user.findFirstOrThrow({
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
        .json({ error: "Incorrect old password. Please try again.s" });
    }
  } catch (error) {
    return response
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ error: "Failed to find account. Please try again." });
  }
}
