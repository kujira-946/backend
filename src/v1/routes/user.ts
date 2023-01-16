import express, { Request, Response } from "express";

const app = express();

enum User {
  FetchAll = "/api/v1/users",
  FetchOne = "/api/v1/user",
  Create = "/api/v1/user",
  Update = "/api/v1/user",
  Delete = "/api/v1//user",
}

app.get(User.FetchAll, (request: Request, response: Response) => {
  response.send("GET all users");
});
