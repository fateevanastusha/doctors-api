import request from "supertest";
import {app} from "../../app";
import {userCreator} from "../../tests-utils/tests-functions";
import {
    userEmailFilterString01,
    userEmailFilterString02,
    userEmailFilterString03,
    userEmailFilterString04,
    userEmailFilterString05,
    userFilterString01,
    userFilterString02,
    userFilterString03,
    userFilterString04,
    userFilterString05

} from "../../tests-utils/test-string";
import {runDb} from "../../db/db";

describe('users', () => {

    jest.setTimeout(3 * 60 * 1000)

    //DELETE ALL DATA

    beforeAll(async () => {
        runDb()
        await request(app)
            .delete('/testing/all-data')
    })

    //CHECK FOR EMPTY USERS DATA BASE

    it ('GET EMPTY USERS DATA BASE', async  () => {
        const res = await request(app)
            .get('/users')
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
        expect(res.body).toStrictEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })

    //UNSUCCESSFULLY CREATE NEW USER WITH NO AUTH

    it ('UNSUCCESSFULLY CREATE NEW USER WITH NO AUTH', async  () => {
        await request(app)
            .post('/users')
            .send({
                login : "nastya",
                password : "qwerty",
                email: "anastasiafateeva2406@gmail.com"
            })
            .expect(401)
    })

    //UNSUCCESSFULLY CREATE NEW USER WITH WRONG DATA

    it ('UNSUCCESSFULLY CREATE NEW USER WITH WRONG DATA', async  () => {
        await request(app)
            .post('/users')
            .send({
                login : "",
                password : "qwerty",
                email: "anastasiafateeva2406@gmail.com"
            })
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
            .expect(400)
    })

    //SUCCESSFULLY CREATE NEW USER

    let createResponseUser : any = null

    it ('SUCCESSFULLY CREATE NEW USER', async  () => {
        createResponseUser = await request(app)
            .post('/users')
            .send({
                login : "nastya",
                password : "qwerty",
                email: "anastasiafateeva2406@gmail.com"
            })
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
            .expect(201)
    })

    //SUCCESSFULLY CHECK FOR CREATED NEW USER WITH PAGINATION

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

    //UNSUCCESSFULLY DELETE USER WITH NO AUTH

    it ('UNSUCCESSFULLY DELETE USER WITH NO AUTH', async  () => {
        await request(app)
            .delete('/users/' + createResponseUser.body.id)
            .expect(401)
    })

    //UNSUCCESSFULLY DELETE NOT EXISTING USER

    it ('UNSUCCESSFULLY DELETE NOT EXISTING USER', async  () => {
        await request(app)
            .delete('/users/notexistingid')
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
            .expect(404)
    })

    //SUCCESSFULLY DELETE CREATED USER

    it ('SUCCESSFULLY DELETE CREATED USER', async  () => {
        await request(app)
            .delete('/users/' + createResponseUser.body.id)
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
            .expect(204)
    })

    //SUCCESSFULLY CREATE 5 NEW USERS

    it('SUCCESSFULLY CREATE 5 POSTS', async () => {
        await userCreator(undefined, userFilterString01, userEmailFilterString01);
        await userCreator(undefined, userFilterString02, userEmailFilterString02);
        await userCreator(undefined, userFilterString03, userEmailFilterString03);
        await userCreator(undefined, userFilterString04, userEmailFilterString04);
        const lastUserResponse = await userCreator(undefined, userFilterString05, userEmailFilterString05);
        expect(lastUserResponse.status).toEqual(201);
    })

    //CHECK CREATED 5 USERS WITH PAGINATION AND SORT BY TITLE

    it('SUCCESSFULLY GET CREATED USERS WITH PAGINATION', async () => {

    })

    //DELETE ALL DATA

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })

})