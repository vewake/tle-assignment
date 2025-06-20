import { Router } from "express";
import { sync } from "../controllers/settingsController.js";

export const settingsRouter = Router()
settingsRouter.get("/sync", sync)



