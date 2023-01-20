import { NextFunction, Request, Response } from "express";

import { allowedUserCreationFormFields } from "../utils/users.utils";
import { HttpStatusCodes } from "../../utils/http-status-codes";

export async function checkUserCreationInvalidFormInput(
  request: Request,
  response: Response,
  next: NextFunction
) {
  Object.keys(request.body).forEach((formField: string) => {
    if (!allowedUserCreationFormFields.includes(formField)) {
      response
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ error: `Invalid form field: ${formField}.` });
    } else {
      next();
    }
  });
}
