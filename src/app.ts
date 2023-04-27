import express, {Request, Response} from 'express'
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { usersRouter } from "./routes/users-router";
import { authRouter } from "./routes/auth-router";
import { emailRouter } from "./routes/email-router";
import {securityRouter} from "./routes/security-router";
import {PostsRepository} from './repositories/posts-db-repositiory';
import {commentsRouter} from "./routes/comments-router";
import cookieParser from "cookie-parser"
import {SecurityRepository} from "./repositories/security-db-repository";
import {BlogsRepository} from "./repositories/blogs-db-repositiory";
import {UsersRepository} from "./repositories/users-db-repository";
import {LikesRepository} from "./repositories/likes-db-repository";
import {CommentsRepository} from "./repositories/comments-db-repository";
export const app = express();

app.use(express.json())
app.use(cookieParser())


app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/email', emailRouter)
app.use('/security', securityRouter)

const postsRepository = new PostsRepository()
const blogsRepository = new BlogsRepository()
const usersRepository = new UsersRepository()
const securityRepository = new SecurityRepository()
const likesRepository = new LikesRepository()
const commentsRepository = new CommentsRepository()

//TESTING - DELETE ALL DATA

app.get('/likes', async (req : Request, res : Response) => {
    res.status(200).send(await likesRepository.getAllLikes())
})

app.get('/comments', async (req: Request, res: Response) => {
    res.status(200).send(await commentsRepository.getAllComments())
})

app.delete('/testing/all-data', async (req: Request,res: Response) => {
    await postsRepository.deleteAllData();
    await blogsRepository.deleteAllData();
    await usersRepository.deleteAllData();
    await securityRepository.deleteAllData();
    await likesRepository.deleteAllData();
    await commentsRepository.deleteAllData()
    res.sendStatus(204)
});

export default app