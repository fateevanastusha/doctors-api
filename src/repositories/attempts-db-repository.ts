import {Attempts} from "../types/types";
import {AttemptsModelClass} from "../types/models";

export const attemptsRepository = {
    async addAttempts(attempt : Attempts) {
        return AttemptsModelClass.insertMany(attempt)
    },
    async countOfAttempts(userIP: string, url: string, timeLimit: Date) {
        return AttemptsModelClass.countDocuments({userIP, url, time: {$gt: timeLimit}})
    }
}