import { NextFunction } from "express";
import { Response, Request } from "express";
import { CustomValidator } from "express-validator/src/base";
import { body, validationResult } from 'express-validator';
import {UsersRepository} from "../repositories/users-db-repository";
import {BlogsRepository} from "../repositories/blogs-db-repositiory";

const usersRepository = new UsersRepository();
const blogsRepository = new BlogsRepository();

//errors storage
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).send({
            errorsMessages: error.array({onlyFirstError: true}).map(e => {
                return {
                    message: e.msg,
                    field: e.param
                }
            })
        })
    }
    next()
}
export const createAccountValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(401).send({
            errorsMessages: error.array({onlyFirstError: true}).map(e => {
                return {
                    message: e.msg,
                    field: e.param
                }
            })
        })
    }
    next()
}
//check for blog
export const nameCheck = body('name').trim().isLength({min: 1, max: 15}).isString();
export const descriptionCheck = body('description').trim().isLength({min: 1, max: 500}).isString();
export const websiteUrlCheck = body('websiteUrl').trim().isLength({min: 1, max: 100}).matches(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/).isString()

//check for blogId
export const findByIdBlogs : CustomValidator = async value => {
    const foundBlog = await blogsRepository.returnBlogById(value);
    if (!foundBlog) {
        throw new Error('not blogId')
    }
};

//check for unique login

export const checkForExistingLogin : CustomValidator = async login => {
    const User = await usersRepository.returnUserByLogin(login)
    if (User) {
        throw new Error('login is already exist')
    }
    return true
}
//check for unique email

export const checkForUniqueEmail : CustomValidator = async email => {
    const User = await usersRepository.returnUserByEmail(email)
    if (User) {
        throw new Error('email is already exist')
    }
    return true
}

//check for existing email

export const checkForEmail : CustomValidator = async email => {
    const User = await usersRepository.returnUserByEmail(email)
    if (!User) {
        throw new Error('email not exist')
    }
    return true
}


export const checkForRecoveryEmail : CustomValidator = async email => {
    const User = await usersRepository.returnUserByEmail(email)
    if (!User) {
        return true
    }
    return true
}


//check for existing confirmation code

export const checkForExistingConfirmationCode : CustomValidator = async code => {
    const status : boolean = await usersRepository.checkForConfirmationCode(code)
    if (!status) {
        throw new Error('code is wrong')
    } else {
        return true
    }
}

//check for confirmed account

export const checkForNotConfirmedByEmailOrCode : CustomValidator = async email => {
    const status : boolean = await usersRepository.checkForConfirmedAccountByEmailOrCode(email)
    if (status) {
        throw new Error('account is confirmed')
    } else {
        return true
    }
}

export const checkForLikeRequest : CustomValidator = async likeStatus => {
    if (likeStatus === 'Like' || likeStatus === 'Dislike' || likeStatus === 'None'){
        return true;
    } else {
        throw new Error('status is invalid')
    }
}

export const checkForPasswordAuth : CustomValidator = async (login, { req }) => {
    const User = await usersRepository.returnUserByField(login)
    if (!User){
        throw new Error('login is already exist')
    }
    const hash = User.password
    const password = req.body.password
    const status = bcrypt.compareSync(password, hash);
    if (!status){
        throw new Error('invalid login or password')
    }
}


//check for post
export const titleCheck = body('title').trim().isLength({min:1, max: 30}).isString()
export const shortDescriptionCheck = body('shortDescription').trim().isLength({min:1,max:100}).isString()
export const contentCheck = body('content').trim().isLength({min:1, max: 1000}).isString()
export const blogIdCheck = body('blogId').trim().custom(findByIdBlogs).isString()

//check for user
export const loginCheck = body('login').isString().trim().notEmpty().isLength({min:3, max: 10}).custom(checkForExistingLogin)
export const passwordCheck = body ('password').trim().isLength({min:6, max: 20}).isString()
export const emailCheck =  body ('email').isString().isEmail().trim().custom(checkForUniqueEmail)

//check for comments
export const commentContentCheck = body('content').trim().isLength({min:20, max: 300}).isString()

//confirmationCheck

export const codeConfirmationCheck = body('code').trim().isLength({min:12, max: 14}).isString().matches(/^\d+$/).custom(checkForExistingConfirmationCode).custom(checkForNotConfirmedByEmailOrCode)
export const emailConfirmationCheck =  body ('email').isString().isEmail().trim().custom(checkForEmail).custom(checkForNotConfirmedByEmailOrCode)
export const emailForRecoveryCheck = body ('email').isEmail().isString().trim()
export const codeForRecoveryConfirmationCheck = body('recoveryCode').trim().isLength({min:12, max: 14}).isString().matches(/^\d+$/).custom(checkForExistingConfirmationCode)
export const passwordForRecoveryCheck = body ('newPassword').trim().isLength({min:6, max: 20}).isString()

//like request check

export const likeRequestCheck = body('likeStatus').trim().isString().isLength({min : 1}).custom(checkForLikeRequest)