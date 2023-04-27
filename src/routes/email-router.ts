import {Request, Response} from 'express'
import { Router } from "express"


export const nodemailer = require("nodemailer");
export const emailRouter = Router()


emailRouter.post('/send', async (req: Request, res: Response) => {

    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "fateevanastushatest@gmail.com", // generated ethereal user
            pass: "wyxeywekunawwoxq", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transport.sendMail({
        from: "Blogs And Videos API", // sender address
        to: req.body.email, // list of receivers
        subject: req.body.subject, // Subject line
        html: req.body.message, // html body
    });
    res.send(200)
})