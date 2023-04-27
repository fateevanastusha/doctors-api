import {Router} from "express";
import {
    codeConfirmationCheck,
    codeForRecoveryConfirmationCheck,
    emailCheck,
    emailConfirmationCheck,
    emailForRecoveryCheck,
    inputValidationMiddleware,
    loginCheck,
    passwordCheck,
    passwordForRecoveryCheck
} from "../middlewares/input-valudation-middleware";
import {
    checkForExistingEmail,
    checkForNotSamePassword,
    checkForRefreshToken,
    checkForSameDevice
} from "../middlewares/auth-middlewares";
import {requestAttemptsMiddleware} from "../middlewares/attempts-middleware";
import {authController, container} from "../compositon-root";
import {AuthController} from "../controllers/auth-controller";
import "reflect-metadata"


export const authRouter = Router()

//LOGIN

authRouter.post('/login',
    requestAttemptsMiddleware,
    checkForSameDevice,
    authController.loginRequest.bind(authController)
)

//GET INFORMATION ABOUT CURRENT AUTH

authRouter.get('/me',
    authController.getInfoAboutUser.bind(authController)
)

//PASSWORD RECOVERY SENDING EMAIL WITH CODE

authRouter.post('/password-recovery',
    requestAttemptsMiddleware,
    emailForRecoveryCheck,
    inputValidationMiddleware,
    checkForExistingEmail,
    authController.passwordRecoverySendEmail.bind(authController)
)

//PASSWORD RECOVERY. CHANGE PASSWORD

authRouter.post('/new-password',
    requestAttemptsMiddleware,
    passwordForRecoveryCheck,
    checkForNotSamePassword,
    codeForRecoveryConfirmationCheck,
    inputValidationMiddleware,
    authController.passwordRecoveryChangePassword.bind(authController)
)


//REGISTRATION IN THE SYSTEM

authRouter.post('/registration',
    loginCheck,
    passwordCheck,
    emailCheck,
    inputValidationMiddleware,
    requestAttemptsMiddleware,
    authController.registrationUser.bind(authController)
)

//CODE CONFIRMATION

authRouter.post('/registration-confirmation',
    requestAttemptsMiddleware,
    codeConfirmationCheck,
    inputValidationMiddleware,
    authController.codeConfirmation.bind(authController)
)

//RESEND CODE CONFIRMATION

authRouter.post('/registration-email-resending',
    requestAttemptsMiddleware,
    emailConfirmationCheck,
    inputValidationMiddleware,
    authController.resendCode.bind(authController)
)

//LOGOUT. KILL REFRESH TOKEN + KILL SESSION

authRouter.post('/logout',
    checkForRefreshToken,
    authController.logoutRequest.bind(authController)
)

//REFRESH TOKEN

authRouter.post('/refresh-token',
    requestAttemptsMiddleware,
    checkForRefreshToken,
    authController.refreshTokenRequest.bind(authController)
)


