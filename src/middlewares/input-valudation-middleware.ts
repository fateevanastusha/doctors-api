import { NextFunction } from "express";
import { Response, Request } from "express";
import {body, CustomValidator, validationResult} from 'express-validator';
import {usersDbRepository} from "../compositon-root";

//Errors storage

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

export const checkForExistingUserLastName : CustomValidator = async userLastName => {
    const user = await usersDbRepository.getUser(userLastName)
    if (!user) {
        throw new Error('not existing user')
    }
    return true
}

export const checkForNotSame : CustomValidator = async term => {
    const user = await usersDbRepository.getUser(term)
    if (user) {
        throw new Error('existing user')
    }
    return true
}

export const isTimeValid : CustomValidator = async time => {
    const inputDate = new Date(time);
    const maxTime = new Date(Date.now() + 1000 * 60 * 121)
    if (inputDate <= maxTime) {
        throw new Error('time is invalid')
    }
    return true
}

//Check create user input

export const firstNameCheckUser = body('firstName').trim().isLength({min: 1, max: 30}).isString();
export const lastNameCheckUser = body('lastName').trim().isLength({min: 1, max: 30}).isString().custom(checkForNotSame)
export const phoneNumberCheckUser = body('phoneNumber').trim().isLength({min: 1, max: 100}).isMobilePhone("any").isString().custom(checkForNotSame)

//Check create doctor input

export const firstNameCheckDoctor = body('firstName').trim().isLength({min: 1, max: 30}).isString();
export const lastNameCheckDoctor = body('lastName').trim().isLength({min: 1, max: 30}).isString();
export const specCheckDoctor = body('spec').trim().isLength({min: 1, max: 100}).isString()

//Check for slot

export const timeCheckSlot = body('time').trim().isString().matches(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/).custom(isTimeValid)
export const lastNameUserExistingCheck = body('userLastName').custom(checkForExistingUserLastName)




