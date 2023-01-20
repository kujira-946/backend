import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "../../utils/http-status-codes";

export function checkUserCreationInvalidFormInput(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const allowedUserCreationFormFields = [
    "email",
    "username",
    "firstName",
    "lastName",
    "birthday",
    "currency",
    "theme",
    "mobileNumber",
  ];

  const invalidFormFields = [];

  const clientFormFields = Object.keys(request.body);
  for (let index = 0; index < clientFormFields.length; index++) {
    const currentClientFormField = clientFormFields[index];
    const theClientSentAnInvalidFormField =
      !allowedUserCreationFormFields.includes(currentClientFormField);
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
}
