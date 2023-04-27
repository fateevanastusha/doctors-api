import request from "supertest";
import {app} from "../../app";
import {MailBoxImap} from "./imap.service";
import {runDb} from "../../db/db";
const nodemailerMock = require('nodemailer-mock');
const MailParser = require('mailparser').MailParser;

describe('security', () => {

    //DELETE ALL DATA

    jest.setTimeout(3 * 60 * 1000)

    const imapService = new MailBoxImap()

    beforeAll(async () => {
        runDb()
        await request(app)
            .delete('/testing/all-data')
            .expect(204)
        await imapService.connectToMail()
    })

    afterAll(async () => {
        await imapService.disconnect()
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

        const sentMessage = await imapService.waitNewMessage(1)
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

    //TRY TO REGISTRATION WITH WRONG DATA

    it('REGISTRATION WITH WRONG DATA', async () => {
        //MAKE REQUEST REGISTRATION
        await request(app)
            .post('/auth/registration')
            .send({
                login : "nastya1",
                email : "fateevanastushatest@yandex.ru",
                password : "qwerty1"
            })
            .expect(400)
        await request(app)
            .post('/auth/registration')
            .send({
                login : "",
                email : "",
                password : ""
            })
            .expect(400)


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
                password : 'qwerty1'
            })
            .expect(200)


    })

    //DELETE ALL DATA

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })
})