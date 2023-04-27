import {NextFunction, Request, Response} from "express";
import {attemptsRepository} from "../repositories/attempts-db-repository";
import {Attempts} from "../types/types";

export const requestAttemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const timeLimit = new Date(new Date().getTime() - 10000)
    const countOfAttempts = await attemptsRepository.countOfAttempts(req.ip, req.url, timeLimit)
    if (countOfAttempts >= 5) return res.sendStatus(429)
    const attempt : Attempts = {
        userIP: req.ip,
        url: req.url,
        time: new Date()
    }
    await attemptsRepository.addAttempts(attempt)
    next()
}