import request from "supertest";
import {app} from "../../app";
import {runDb} from "../../db/db";

describe('api', () => {

    jest.setTimeout(3 * 60 * 1000)

    //delete all data

    beforeAll(async () => {
        //start mongo db
        runDb()
        await request(app)
            .delete('/delete-all')
    })

    //check delete all data

    it ('get empty array', async  () => {
        const res = await request(app)
            .get('/users')
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
        expect(res.body).toStrictEqual([])
    })

    //to get user id

    let responseUser : any

    //create new user

    it ('create new user', async  () => {
        responseUser = await request(app)
            .post('/users')
            .send({
                firstName : "Anastasia",
                lastName : "Fateeva",
                phoneNumber : "+79158398127"
            })
            .expect(201)
    })

    //delete not existing user

    it('get 404 error for delete request', async () => {
        await request(app)
            .delete('/users/not-existing')
            .expect(404)
    })

    //get not existing user

    it('get 404 error for get request', async () => {
        await request(app)
            .get('/users/not-existing')
            .expect(404)
    })

    //create user with wrong request

    it('get 400 error for wrong request', async () => {
        let res = await request(app)
            .post('/users')
            .send({
                lastName : "Fateeva",
                phoneNumber : "+79158398127"
            })
            .expect(400)
        expect(res.body).toStrictEqual({
            "errorsMessages": [
                {
                    "field": "firstName",
                    "message": "Invalid value"
                }
            ]
        })
    })

    let responseDoctor : any

    //create new doctor

    it ('create new doctor', async  () => {
        responseDoctor = await request(app)
            .post('/doctors')
            .send({
                firstName : "Vasya",
                lastName : "Ivanov",
                spec : "Surgeon"
            })
            .expect(201)
    })

    //get created doctor

    it('get created doctor', async () => {
        let req = await request(app)
            .get('/doctors/' + responseDoctor.body.id )
            .expect(200)
        expect(req.body).toStrictEqual({
            firstName : "Vasya",
            lastName : "Ivanov",
            spec : "Surgeon",
            id : responseDoctor.body.id,
            slots : []
        })
    })

    //get created doctor by terms

    it('get created doctor by terms', async () => {
        let res = await request(app)
            .get('/doctors/Ivanov')
            .expect(200)
        expect(res.body).toStrictEqual({
            firstName : "Vasya",
            lastName : "Ivanov",
            spec : "Surgeon",
            id : responseDoctor.body.id,
            slots : []
        })
    })

    //delete not existing doctor

    it('get 404 error for get request', async () => {
        await request(app)
            .delete('/doctors/not-existing')
            .expect(404)
    })


    //create doctor with wrong data

    it('get 400 error for wrong request', async () => {
        let res = await request(app)
            .post('/doctors')
            .send({
                lastName : "Fateeva",
            })
            .expect(400)
        expect(res.body).toStrictEqual({
            "errorsMessages": [
                {
                    "field": "firstName",
                    "message": "Invalid value"
                },
                {
                    "field": "spec",
                    "message": "Invalid value"
                }
            ]
        })
    })

    //delete all data

})