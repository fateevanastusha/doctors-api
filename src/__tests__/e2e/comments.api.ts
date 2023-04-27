import request from "supertest";
import {app} from "../../app";
import {runDb} from "../../db/db";

describe('comments',  () => {

    jest.setTimeout(3 * 60 * 1000)
    //DELETE ALL DATA

    beforeAll(async () => {
        await runDb()
        await request(app)
            .delete('/testing/all-data')
            .expect(204)

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
        expect(blog.body).toEqual({
            "id": expect.any(String),
            "name": "Nastya",
            "description": "about me",
            "websiteUrl": "http://www.nastyastar.com",
            "createdAt" : expect.any(String),
            "isMembership" : false
        })
    })

    let token : any = null

    //SUCCESSFULLY AUTH

    it('SUCCESSFULLY AUTH', async () => {
        let token = await request(app)
            .post('/auth/login')
            .send(
                {
                    loginOrEmail : "nastya",
                    password : "qwerty"
                }
            )
            .expect(200)

    })

    //UNSUCCESSFULLY CREATE NEW COMMENT WITHOUT TOKEN



    //SUCCESSFULLY CREATE NEW COMMENT WITH TOKEN

    //DELETE COMMENT WITH WRONG TOKEN

    //DELETE COMMENT WITHOUT TOKEN

    //SUCCESSFULLY DELETE COMMENT

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })



})

