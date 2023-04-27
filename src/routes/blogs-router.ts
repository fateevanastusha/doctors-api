import { Router } from "express"
export const blogsRouter = Router()
import {
    inputValidationMiddleware,
    titleCheck,
    shortDescriptionCheck,
    contentCheck,
    nameCheck,
    descriptionCheck,
    websiteUrlCheck
}
from "../middlewares/input-valudation-middleware";
import {blogsController} from "../compositon-root";


export const basicAuth = require('express-basic-auth')
export const adminAuth = basicAuth({users: { 'admin': 'qwerty' }});

//GET - return all
blogsRouter.get('/',
    blogsController.getAllBlogs.bind(blogsController)
);
//GET - return by ID
blogsRouter.get('/:id',
    blogsController.getBlogsById.bind(blogsController)
);
//DELETE - delete by ID
blogsRouter.delete('/:id',
    adminAuth, blogsController.deleteBlogById.bind(blogsController)
);
//POST - create new
blogsRouter.post('/',
    adminAuth,
    nameCheck,
    descriptionCheck,
    websiteUrlCheck,
    inputValidationMiddleware,
    blogsController.createBlog.bind(blogsController)
);
//PUT - update
blogsRouter.put('/:id',
    adminAuth,
    nameCheck,
    descriptionCheck,
    websiteUrlCheck,
    inputValidationMiddleware,
    blogsController.updateBlog.bind(blogsController)
);
//NEW - POST - create post for blog
blogsRouter.post('/:id/posts',
    adminAuth,
    titleCheck,
    shortDescriptionCheck,
    contentCheck,
    inputValidationMiddleware,
    blogsController.createPostForBlog.bind(blogsController));
//NEW - GET - get all posts in blog
blogsRouter.get('/:id/posts',
    blogsController.getPostsByBlog.bind(blogsController)
);


