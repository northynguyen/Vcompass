import express from "express";
import {getSatisfactionsByUser, createSatisfaction} from "../controllers/userSatisfactionController.js"

const userSatisRouter = express.Router();

userSatisRouter.post("/", createSatisfaction);

userSatisRouter.get("/getAll", getSatisfactionsByUser);

export default userSatisRouter;
