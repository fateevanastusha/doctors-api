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
        let res = await request(app)
            .get('/users')
        expect(res.body).toStrictEqual([])
        res = await request(app)
            .get('/doctors')
        expect(res.body).toStrictEqual([])
    })

    //to get user id

    let responseUser : any

    //create user with wrong request

    it('get 400 error for wrong request', async () => {
        let res = await request(app)
            .post('/users')
            .send({
                lastName : "Sergeev",
                phoneNumber : "+79158391243"
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

    //create new user and get it

    it ('create new user', async  () => {
        responseUser = await request(app)
            .post('/users')
            .send({
                firstName : "Anastasia",
                lastName : "Fateeva",
                phoneNumber : "+79158398127"
            })
            .expect(201)
        let res = await request(app)
            .get('/users/' + responseUser.body.id)
        expect(res.body).toStrictEqual({
            firstName : "Anastasia",
            lastName : "Fateeva",
            phoneNumber : "+79158398127",
            id : responseUser.body.id
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

    //create available slot

    it('create available slot', async () => {
        await request(app)
            .post('/doctors/slot/Ivanov')
            .send({
                time : "2023-05-28T14:51:12.543Z"
            })
            .expect(204)

        //check for slot

        let res = await request(app)
            .get('/doctors/Ivanov')

        expect(res.body).toStrictEqual({
            firstName : "Vasya",
            lastName : "Ivanov",
            spec : "Surgeon",
            id : responseDoctor.body.id,
            slots : [
                {
                    id : expect.any(String),
                    time : "2023-05-28T14:51:12.543Z"
                }
            ]
        })


    })

    //create not available slot, get 400 error

    it('create not available slot, get 400 error', async () => {
        let res = await request(app)
            .post('/doctors/slot/Ivanov')
            .send({
                time : "2023-04-28T14:51:12.543Z"
            })
            .expect(400)
        //check for slot
        expect(res.body).toStrictEqual({
            "errorsMessages": [
                {
                    "field": "time",
                    "message": "time is invalid"
                }
            ]
        })
        //check for not created slot
        res = await request(app)
            .get('/doctors/Ivanov')

        expect(res.body).toStrictEqual({
            firstName : "Vasya",
            lastName : "Ivanov",
            spec : "Surgeon",
            id : responseDoctor.body.id,
            slots : [
                {
                    id : expect.any(String),
                    time : "2023-05-28T14:51:12.543Z"
                }
            ]
        })

    })

    //delete slot

    it('delete slot', async () => {
         let res : any
         await request(app)
            .delete('/doctors/slot/Ivanov')
            .send({
                userLastName : "Fateeva",
                time : "2023-05-28T14:51:12.543Z"
            })
            .expect(204)

        //check for deleted slot
        res = await request(app)
            .get('/doctors/Ivanov')

        expect(res.body).toStrictEqual({
            firstName : "Vasya",
            lastName : "Ivanov",
            spec : "Surgeon",
            id : responseDoctor.body.id,
            slots : []
        })

    })

    //delete created doctor

    it('delete created doctor', async () => {
        await request(app)
            .delete('/doctors/Ivanov')
            .expect(204)
        let res = await request(app)
            .get('/doctors')
        expect(res.body).toStrictEqual([])
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

})