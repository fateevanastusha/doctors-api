import "reflect-metadata"
import {UsersRepository} from "./repositories/users-db-repository";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./controllers/users-controller";
import {SecurityRepository} from "./repositories/security-db-repository";
import {SecurityService} from "./domain/security-service";
import {SecurityController} from "./controllers/security-controller";
import {PostsRepository} from "./repositories/posts-db-repositiory";
import {PostsService} from "./domain/posts-service";
import {PostsController} from "./controllers/posts-controller";
import {CommentsRepository} from "./repositories/comments-db-repository";
import {CommentsService} from "./domain/comments-service";
import {CommentsController} from "./controllers/comments-controller";
import {BlogsRepository} from "./repositories/blogs-db-repositiory";
import {BlogsService} from "./domain/blogs-service";
import {BlogsController} from "./controllers/blogs-controller";
import {AuthRepository} from "./repositories/auth-db-repository";
import {AuthService} from "./domain/auth-service";
import {AuthController} from "./controllers/auth-controller";
import {LikesHelpers} from "./helpers/likes-helpers";
import {LikesRepository} from "./repositories/likes-db-repository";
import {JwtService} from "./application/jwt-service";
import {Container} from "inversify";


export const likesHelpers = new LikesHelpers()
export const likesRepository = new LikesRepository()
export const jwtService=  new JwtService()

export const securityRepository = new SecurityRepository()
export const securityService = new SecurityService(securityRepository, jwtService)
export const securityController = new SecurityController(securityService)

export const usersRepository = new UsersRepository()
export const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService)

export const commentsRepository = new CommentsRepository()
export const commentsService = new CommentsService(usersService, commentsRepository, likesRepository, likesHelpers)
export const commentsController = new CommentsController(commentsService, likesHelpers, jwtService)

export const postsRepository = new PostsRepository()
export const postsService = new PostsService(postsRepository, likesRepository, likesHelpers)

export const blogsRepository = new BlogsRepository()
export const blogsService = new BlogsService(blogsRepository)
export const blogsController = new BlogsController(blogsService, postsService, jwtService)

export const postsController = new PostsController(postsService, blogsService, postsRepository, commentsService, jwtService)

export const authRepository = new AuthRepository()
export const authService = new AuthService(authRepository, usersService, usersRepository, jwtService)
export const authController = new AuthController(authService)

export const container = new Container();
container.bind(UsersController).to(UsersController)
container.bind<UsersService>(UsersService).to(UsersService)
container.bind<UsersRepository>(UsersRepository).to(UsersRepository)