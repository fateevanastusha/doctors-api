import express, {Request, Response} from 'express'
import { usersRouter } from "./routes/users-router";
import cookieParser from "cookie-parser"
import {usersDbRepository, doctorsDbRepository} from "./compositon-root";
import {doctorsRouter} from "./routes/doctors-router";

export const app = express();

app.use(express.json())
app.use(cookieParser())

app.use('/users', usersRouter)
app.use('/doctors', doctorsRouter)



//Delete all data for tests

app.delete('/delete-all', async (req: Request,res: Response) => {
    usersDbRepository.deleteAllData()
    doctorsDbRepository.deleteAllData()
    res.sendStatus(204)
});

export default app