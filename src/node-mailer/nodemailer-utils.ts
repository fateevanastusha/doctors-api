import nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "fateevanastushatest@gmail.com", // generated ethereal user
        pass: "wyxeywekunawwoxq", // generated ethereal password
    },
});