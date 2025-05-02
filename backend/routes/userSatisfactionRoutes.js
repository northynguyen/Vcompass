import express from "express";
import {getSatisfactionsByUser, createSatisfaction} from "../controllers/userSatisfactionController.js"

const userSatisRouter = express.Router();

userSatisRouter.post("/", createSatisfaction);

// GET: Lấy tất cả hành vi của một user
userSatisRouter.get("/:userId", getSatisfactionsByUser);

export default userSatisRouter;
