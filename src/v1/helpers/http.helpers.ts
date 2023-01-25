import { Response } from "express";

import { HttpStatusCodes } from "../../utils/http-status-codes";

type Message<WildcardMessageContent> = {
  title?: string;
  body: string;
  footnote?: string;
} & WildcardMessageContent;

type Success = "ok" | "created" | "no content";
export function respondWithSuccess<WildcardMessageContent>(
  response: Response,
  httpStatusCode: Success,
  message: Message<WildcardMessageContent>
) {
  switch (httpStatusCode) {
    case "ok":
      return response.status(HttpStatusCodes.OK).json(message);
    case "created":
      return response.status(HttpStatusCodes.CREATED).json(message);
    default:
      return response.status(HttpStatusCodes.NO_CONTENT).json(message);
  }
}

type Redirect = "permanent redirect";
export function respondWithRedirect<WildcardMessageContent>(
  response: Response,
  httpStatusCode: Redirect,
  message: Message<WildcardMessageContent>
) {
  switch (httpStatusCode) {
    default:
      return response.status(HttpStatusCodes.PERMANENT_REDIRECT).json(message);
  }
}

type ClientError =
  | "bad request"
  | "unauthorized"
  | "payment required"
  | "forbidden"
  | "not found"
  | "page no longer available"
  | "unprocessable identity"
  | "too many requests";
export function respondWithClientError<WildcardMessageContent>(
  response: Response,
  httpStatusCode: ClientError,
  message: Message<WildcardMessageContent>
) {
  switch (httpStatusCode) {
    case "bad request":
      return response.status(HttpStatusCodes.BAD_REQUEST).json(message);
    case "unauthorized":
      return response.status(HttpStatusCodes.UNAUTHORIZED).json(message);
    case "payment required":
      return response.status(HttpStatusCodes.PAYMENT_REQUIRED).json(message);
    case "forbidden":
      return response.status(HttpStatusCodes.FORBIDDEN).json(message);
    case "not found":
      return response.status(HttpStatusCodes.NOT_FOUND).json(message);
    case "page no longer available":
      return response
        .status(HttpStatusCodes.PAGE_NO_LONGER_AVAILABLE)
        .json(message);
    case "unprocessable identity":
      return response
        .status(HttpStatusCodes.UNPROCESSABLE_ENTITY)
        .json(message);
    default:
      return response.status(HttpStatusCodes.TOO_MANY_REQUESTS).json(message);
  }
}

type ServerError = "internal server error" | "service unavailable";
export function respondWithServerError<WildcardMessageContent>(
  response: Response,
  httpStatusCode: ServerError,
  message: Message<WildcardMessageContent>
) {
  switch (httpStatusCode) {
    case "internal server error":
      return response
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json(message);
    default:
      return response.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json(message);
  }
}
