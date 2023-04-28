import {Router} from "express";
import {usersController} from "../compositon-root";
import {
    firstNameCheckUser,
    inputValidationMiddleware,
    lastNameCheckUser,
    phoneNumberCheckUser
} from "../middlewares/input-valudation-middleware";

export const usersRouter = Router()

//Get user

usersRouter.get('/:term',
    usersController.getUser.bind(usersController)
)

//Get users

usersRouter.get('/',
    usersController.getUsers.bind(usersController)
)

//Delete user

usersRouter.delete('/:term',
    usersController.deleteUser.bind(usersController)
)

//Create user

usersRouter.post('/',
    firstNameCheckUser,
    lastNameCheckUser,
    phoneNumberCheckUser,
    inputValidationMiddleware,
    usersController.createUser.bind(usersController)
)
