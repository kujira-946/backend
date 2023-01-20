import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";

// ========================================================================================= //
// [ CHECKS IF THE CLIENT HAS SENT ANY INVALID FORM FIELDS ] ================================ //
// ========================================================================================= //

export function checkInvalidFormFieldsMiddleware(allowedFormFields: string[]) {
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
// [ CHECKS IF THE CLIENT FAILED TO SEND ALL REQUIRED FORM FIELDS ] ======================== //
// ========================================================================================= //

// ↓↓↓ NOTE : This function is BEST used by FIRST using `checkInvalidFormFieldsMiddleware` to make sure that the client didn't send any invalid form fields. ↓↓↓

export function checkIfAllRequiredFormFieldsWereSentMiddleware(
  requiredFormFields: string[]
) {
  return function (request: Request, response: Response, next: NextFunction) {
    const missingFormFields: string[] = [];
    const clientFormFields = Object.keys(request.body);

    requiredFormFields.forEach((requiredFormField: string) => {
      if (!clientFormFields.includes(requiredFormField)) {
        missingFormFields.push(requiredFormField);
      }
    });

    if (missingFormFields.length > 0) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: `Missing form field(s): ${missingFormFields.join(", ")}.`,
      });
    } else {
      next();
    }
  };
}

// ========================================================================================= //
// [ CHECKS IF THE CLIENT HAS SENT AT LEAST ONE REQUIRED FORM FIELD ] ====================== //
// ========================================================================================= //

export function checkIfAtLeastOneRequiredFormFieldWasSentMiddleware(
  requiredFormFields: string[]
) {
  return function (request: Request, response: Response, next: NextFunction) {};
}
