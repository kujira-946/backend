import { NextFunction, Request, Response } from "express";

import { HttpStatusCodes } from "./../../utils/http-status-codes";

// ========================================================================================= //
// [ MAKING SURE THE CLIENT HAS INPUTTED ALL FIELDS REQUIRED BY ENDPOINT ] ================= //
// ========================================================================================= //

function _generateInvalidClientInputs(
  expectedClientInputs: string[],
  providedClientInputs: string[]
): string[] {
  return providedClientInputs.filter((providedClientInput: string) => {
    return !expectedClientInputs.includes(providedClientInput);
  });
}

function _generateMissingClientInputs(
  expectedClientInputs: string[],
  providedClientInputs: string[]
): string[] {
  return expectedClientInputs.filter((expectedClientInput: string) => {
    return !providedClientInputs.includes(expectedClientInput);
  });
}

function _checkAtLeastOneRequiredInputProvided(
  expectedClientInputs: string[],
  providedClientInputs: string[]
): boolean {
  for (let index = 0; index < providedClientInputs.length; index++) {
    const providedClientInput = providedClientInputs[index];
    return expectedClientInputs.includes(providedClientInput);
  }
  return false;
}

type RequireAllInputs = { requireAllInputs: boolean };
export function checkValidityOfClientRequestMiddleware(
  expectedClientInputs: string[],
  { requireAllInputs }: RequireAllInputs = { requireAllInputs: true }
) {
  return function (request: Request, response: Response, next: NextFunction) {
    const providedClientInputs = Object.keys(request.body);

    // ↓↓↓ Any form inputs sent by the client that are not supposed to be in the payload. ↓↓↓
    const invalidClientInputs = _generateInvalidClientInputs(
      expectedClientInputs,
      providedClientInputs
    );
    // ↓↓↓ If there were any invalid client inputs, send HTTP 400 error to the client and stop the validity check here. ↓↓↓
    if (invalidClientInputs.length > 0) {
      return response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: `Invalid input(s): ${invalidClientInputs.join(", ")}.`,
      });
    }

    // ↓↓↓ If the client didn't provide any invalid form input, move onto checking to see if it provided all required form inputs. ↓↓↓
    else {
      // ↓↓↓ If we require that all expected client inputs be provided. `true` by default. ↓↓↓
      if (requireAllInputs) {
        const missingClientInputs = _generateMissingClientInputs(
          expectedClientInputs,
          providedClientInputs
        );
        // ↓↓↓ If the client didn't provide all required form inputs, respond with a HTTP 400 error to the client and stop the validity check here. ↓↓↓
        if (missingClientInputs.length > 0) {
          return response.status(HttpStatusCodes.BAD_REQUEST).json({
            error: `Missing input(s): ${missingClientInputs.join(", ")}.`,
          });
        }
        // ↓↓↓ If we've reached this point, there are no issues, so we're good to go. ↓↓↓
        else {
          return next();
        }
      }
      // ↓↓↓ If we only require at least one expected client input be provided. ↓↓↓
      else {
        const atLeastOneRequiredInputProvided =
          _checkAtLeastOneRequiredInputProvided(
            expectedClientInputs,
            providedClientInputs
          );
        if (atLeastOneRequiredInputProvided) {
          // ↓↓↓ If we've reached this point, there are no issues, so we're good to go. ↓↓↓
          return next();
        } else {
          return response.status(HttpStatusCodes.BAD_REQUEST).json({
            error:
              "Missing at least one required field. Please provide the missing field and try again.",
          });
        }
      }
    }
  };
}
