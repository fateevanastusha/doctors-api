import request from "supertest";
import {app} from "../../app";
import {MailBoxImap} from "./imap.service";
import {runDb} from "../../db/db";
const nodemailerMock = require('nodemailer-mock');
const MailParser = require('mailparser').MailParser;

describe('auth', () => {
    //DELETE ALL DATA
    jest.setTimeout(3 * 60 * 1000)

    const imapService = new MailBoxImap()

    beforeAll(async () => {
        await runDb()
        await request(app)
            .delete('/testing/all-data')
            .expect(204)
        await imapService.connectToMail()
    })

    afterAll(async () => {
        await imapService.disconnect()
    })

    //SUCCESSFULLY CREATE USER

    let createResponseUser : any = null

    it ('SUCCESSFULLY CREATE NEW USER', async  () => {
        createResponseUser = await request(app)
            .post('/users')
            .send({
                login : "nastya",
                password : "qwerty",
                email: "anatasiafateva2406@gmail.com"
            })
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
            .expect(201)
    })

    //CHECK FOR CREATED USER

    it ('SUCCESSFULLY CHECK FOR CREATED NEW USER WITH PAGINATION', async () => {
        const users = await request(app)
            .get('/users')
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
        expect(users.body).toStrictEqual(
            {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id : createResponseUser.body.id,
                        login : "nastya",
                        email: "anastasiafateeva2406@gmail.com",
                        createdAt: expect.any(String),
                        isConfirmed : true
                    }
                ]
            }
        )

    })



    //UNSUCCESSFULLY AUTH WITH WRONG PASSWORD

    it('UNSUCCESSFULLY AUTH WITH WRONG PASSWORD', async () => {
        await request(app)
            .post('/auth')
            .send(
                {
                    loginOrEmail : "nastya",
                    password : "WRONG PASSWORD"
                }
            )
            .expect(404)

    })

    let createResponseBlog : any = null

    //CREATE NEW BLOG

    it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
        createResponseBlog = await request(app)
            .post('/blogs')
            .send({
                "name": "Nastya",
                "description": "about me",
                "websiteUrl": "http://www.nastyastar.com"
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(201)
    })

    //GET CREATED BLOG

    it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
        const blog = await request(app)
            .get( "/blogs/" + createResponseBlog.body.id)
        expect(blog.body).toStrictEqual({
            "id": expect.any(String),
            "name": "Nastya",
            "description": "about me",
            "websiteUrl": "http://www.nastyastar.com",
            "createdAt" : expect.any(String),
            "isMembership" : false
        })
    })

    let createResponsePost : any = null

    it ('SUCCESSFULLY CREATE NEW POST', async () => {
        createResponsePost = await request(app)
            .post('/posts')
            .send({
                "title": "string",
                "shortDescription": "string",
                "content": "string",
                "blogId": createResponseBlog.body.id
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(201)
    })

    //CHECK FOR CREATED POST

    it ('SUCCESSFULLY GET CREATED POST', async () => {
        const post = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(post.body).toStrictEqual({
            "id" : createResponsePost.body.id,
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String)
        })
    })

    //SUCCESSFULLY AUTH

    let token : any = null

    it('SUCCESSFULLY AUTH', async () => {
        token = await request(app)
            .post('/auth/login')
            .send(
                {
                    loginOrEmail : "nastya",
                    password : "qwerty"
                }
            )
            .expect(200)

    })

    //GET INFO ABOUT USER

    it('SUCCESSFULLY GET USER INFO', async () => {
        const res = await request(app)
            .get('/auth/me')
            .send(token.body)
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual({
            login : "nastya",
            email : "anastasiafateeva2406@gmail.com",
            id: createResponseUser.body.id
        })

    })

    //UNSUCCESSFULLY CREATE NEW COMMENT WITH WRONG TOKEN

    it('UNSUCCESSFULLY CREATE NEW COMMENT WITH WRONG TOKEN', async () => {
        await request(app)
            .post('/posts' + createResponsePost.body.id + '/comment')
            .send({
                content : 'too little'
            })
    })


    //SUCCESSFULLY REGISTRATION

    //MOCK FUNCTION JEST

    it('TEST EMAIL SENDING', async () => {
        //MAKE REQUEST REGISTRATION
        const resp = await request(app)
            .post('/auth/registration')
            .send({
                login : "nastya1",
                email : "fateevanastushatest@yandex.ru",
                password : "qwerty1"
            })

        //UNSUCCESSFULLY EMAIL RESENDING

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email : "notexisting@gmail.com"
            })
            .expect(400)

        //SUCCESSFULLY EMAIL RESENDING

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email : "fateevanastushatest@yandex.ru"
            })
            .expect(204)

        const sentMessage = await imapService.waitNewMessage(2)
        const html: string | null = await imapService.getMessageHtml(sentMessage)
        expect(html).toBeDefined()
        const code : string = html!.split("?code=")[1].split("'")[0]

        //NOT EXISTING CODE - EXPECT 400

        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                "code" : "not existing code"
            })
            .expect(400)

        //CORRECT CODE - EXPECT 204 AND CONFIRMED ACCOUNT

        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                "code" : code
            })
            .expect(204)

    });

    //SUCCESSFULLY CHANGE PASSWORD

    it('TEST PASSWORD RECOVERY', async () => {
        //UNSUCCESSFULLY MAKE REQUEST REGISTRATION
        await request(app)
            .post('/auth/password-recovery')
            .send({
                email : "fateevanastushatest@yandex.r",
            })
            .expect(204)
        //MAKE REQUEST REGISTRATION
        await request(app)
            .post('/auth/password-recovery')
            .send({
                email : "fateevanastushatest@yandex.ru",
            })
            .expect(204)


        const sentMessage = await imapService.waitNewMessage(2)
        const html: string | null = await imapService.getMessageHtml(sentMessage)
        expect(html).toBeDefined()
        const code : string = html!.split("?code=")[1].split("'")[0]

        //NOT EXISTING CODE - EXPECT 400

        await request(app)
            .post('/auth/password-new')
            .send({
                "newPassword": "qwerty11",
                "recoveryCode": code
            })
            .expect(204)

    });

    //TESTING LOGIN

    it ('TEST LOGIN IN SYSTEM', async  () => {
        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail : 'fateevanastushatest@yandex.ru',
                password : 'WRONG PASSWORD'
            })
            .expect(401)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail : 'fateevanastushatest@yandex.ru',
                password : 'WRONG PASSWORD'
            })
            .expect(401)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail : 'fateevanastushatest@yandex.ru',
                password : 'qwerty11'
            })
            .expect(200)


    })



    //UNSUCCESSFULLY CREATE NEW COMMENT WITHOUT TOKEN



    //UNSUCCESSFULLY CREATE NEW COMMENT WITH WRONG DATA



    //SUCCESSFULLY CREATE NEW COMMENT



    //DELETE ALL DATA

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })
})