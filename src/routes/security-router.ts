import {Router} from 'express'
import {checkForDeviceId, checkForRefreshToken, checkForSameUser} from "../middlewares/auth-middlewares";
import {securityController} from "../compositon-root";

export const securityRouter = Router()

//GET ALL SESSIONS

securityRouter.get('/devices',
    checkForRefreshToken,
    securityController.getAllSessions.bind(securityController)
)

//DELETE ALL SESSIONS

securityRouter.delete('/devices',
    checkForRefreshToken,
    securityController.deleteAllSessions.bind(securityController)
)

//DELETE SESSION

securityRouter.delete('/devices/:id',
    checkForRefreshToken,
    checkForDeviceId,
    checkForSameUser,
    securityController.deleteSession.bind(securityController)
)