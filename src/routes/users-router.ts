import {Router} from "express";
import {emailCheck, loginCheck, passwordCheck, inputValidationMiddleware} from "../middlewares/input-valudation-middleware";
import {adminAuth} from "./blogs-router";
import {usersController} from "../compositon-root";

export const usersRouter = Router()


//GET ALL USERS WITH AUTH

usersRouter.get('/',
    adminAuth,
    usersController.getAllUsers.bind(usersController)
);

//POST USER WITH AUTH

usersRouter.post('/',
    adminAuth,
    loginCheck,
    passwordCheck,
    emailCheck,
    inputValidationMiddleware,
    usersController.createNewUser.bind(usersController),
);

//DELETE USER BY ID WITH AUTH

usersRouter.delete('/:id',
    adminAuth,
    usersController.deleteUser.bind(usersController)
);
