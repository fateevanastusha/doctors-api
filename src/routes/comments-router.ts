import {Router} from "express";
import {
    commentContentCheck,
    inputValidationMiddleware,
    likeRequestCheck
} from "../middlewares/input-valudation-middleware";
import {authMiddlewares, checkForUser} from "../middlewares/auth-middlewares";
import {commentsController} from "../compositon-root";

export const commentsRouter = Router()

//GET COMMENT BY ID
commentsRouter.get('/:id',
    commentsController.getCommentById.bind(commentsController)
);
//DELETE COMMENT BY ID
commentsRouter.delete('/:id',
    authMiddlewares,
    checkForUser,
    commentsController.deleteCommentById.bind(commentsController)
);
//UPDATE COMMENT BY ID
commentsRouter.put('/:id',
    authMiddlewares,
    checkForUser,
    commentContentCheck,
    inputValidationMiddleware,
    commentsController.updateCommentById.bind(commentsController)
);

commentsRouter.put('/:id/like-status',
    authMiddlewares,
    likeRequestCheck,
    inputValidationMiddleware,
    commentsController.changeLikeStatus.bind(commentsController)
)