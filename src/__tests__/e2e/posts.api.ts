import request from "supertest";
import {app} from "../../app";
import {blogCreator, postCreator} from "../../tests-utils/tests-functions";
import {
    postFilterString01,
    postFilterString02,
    postFilterString03,
    postFilterString04,
    postFilterString05
} from "../../tests-utils/test-string";
import {runDb} from "../../db/db";


describe('posts', () => {

    jest.setTimeout(3 * 60 * 1000)

    //DELETE ALL DATA

    beforeAll(async () => {
        await runDb()
        await request(app)
            .delete('/testing/all-data')
            .expect(204)

    })

    //CHECK FOR EMPTY POST DATA BASE

    it ('GET EMPTY POST DATA BASE', async  () => {
        const res = await request(app).get('/posts')
        expect(res.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })

    let blogId : any = null

    it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
        blogId = await request(app)
            .post('/blogs')
            .send({
                "name": "Nastya",
                "description": "about me",
                "websiteUrl": "http://www.nastyastar.com"
            })
            .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
        expect(blogId.body).toStrictEqual({
            "id": expect.any(String),
            "name": "Nastya",
            "description": "about me",
            "websiteUrl": "http://www.nastyastar.com",
            "createdAt" : expect.any(String),
            "isMembership" : false
        })
    })

    //UNSUCCESSFULLY CREATE NEW POST WITH NO AUTH

    it ('UNSUCCESSFULLY CREATE NEW POST WITH NO AUTH', async () => {
        await request(app)
            .post('/posts')
            .send({
                "title": "string",
                "shortDescription": "string",
                "content": "string",
                "blogId": blogId.body.id
            })
            .expect(401)
    })

    //UNSUCCESSFULLY CREATE NEW POST WITH BAD DATA

    it ('UNSUCCESSFULLY CREATE NEW POST WITH BAD DATA', async () => {
       await request(app)
            .post('/posts')
            .send({
                "title": "",
                "shortDescription": "",
                "content": "",
                "blogId": ""
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(400)
    })

    //UNSUCCESSFULLY CREATE NEW POST WITH WRONG DATA

    it ('UNSUCCESSFULLY CREATE NEW POST WITH WRONG DATA', async () => {
        await request(app)
            .post('/posts')
            .send({
                "title": "",
                "shortDescription": "",
                "content": "string",
                "blogId": blogId.body.id
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(400)
    })

    //SUCCESSFULLY CREATE NEW POST

    let createResponsePost : any = null

    it ('SUCCESSFULLY CREATE NEW POST', async () => {
        createResponsePost = await request(app)
            .post('/posts')
            .send({
                "title": "string",
                "shortDescription": "string",
                "content": "string",
                "blogId": blogId.body.id
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(201)
    })

    //CHECK FOR CREATED POST

    it ('SUCCESSFULLY GET CREATED POST', async () => {
        const post = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(post.body).toStrictEqual({
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": blogId.body.id,
            "blogName" : blogId.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id
        })
    })

    //SUCCESSFULLY UPDATE CREATED POST

    it ('SUCCESSFULLY UPDATE CREATED POST', async () => {
        const req = await request(app)
            .put("/posts/" + createResponsePost.body.id)
            .send({
                "title": "updated string",
                "shortDescription": "updated string",
                "content": "updated string",
                "blogId" : blogId.body.id
            })
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
        expect(req.statusCode).toBe(204)
    })

    //CHECK FOR UPDATED POST

    it ('SUCCESSFULLY GET UPDATED POST', async () => {
        const post = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(post.body).toStrictEqual({
            "id" : expect.any(String),
            "title": "updated string",
            "shortDescription": "updated string",
            "content": "updated string",
            "blogId": blogId.body.id,
            "blogName" : blogId.body.name,
            "createdAt" : expect.any(String)
        })
    })

    //GET NOT EXISTING POST

    it ('UNSUCCESSFULLY GET NOT EXISTING POST', async () => {
        await request(app)
            .get('/posts/notexistingid')
            .expect(404)
    })

    //UNSUCCESSFULLY DELETE POST WITH NO AUTH

    it ('UNSUCCESSFULLY DELETE POST WITH NO AUTH', async () => {
        await request(app)
            .delete('/posts/' + createResponsePost.body.id)
            .expect(401)
    })

    //SUCCESSFULLY DELETE POST

    it ('SUCCESSFULLY DELETE POST', async () => {
        await request(app)
            .delete('/posts/' + createResponsePost.body.id)
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)
    })

    //DELETE NOT EXISTING POST

    it ('UNSUCCESSFULLY DELETE NOT EXISTING POST', async () => {
        await request(app)
            .delete('/posts/notexistingid')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(404)
    })

    //SUCCESSFULLY CREATE 5 POSTS

    it("SUCCESSFULLY CREATE 5 POSTS", async () => {
        await postCreator(undefined, blogId.body.id, postFilterString01);
        await postCreator(undefined, blogId.body.id, postFilterString02);
        await postCreator(undefined, blogId.body.id, postFilterString03);
        await postCreator(undefined, blogId.body.id, postFilterString04);
        const lastPostResponse = await postCreator(undefined, blogId.body.id, postFilterString05);
        expect(lastPostResponse.status).toBe(201);
    })

    //CHECK FOR 5 CREATED POSTS WITH PAGINATION AND SORT BY TITLE

    it ("CHECK POSTS FOR PAGINATION WITH SORT BY NAME", async () => {
        const post = await request(app)
            .get( "/posts?sortBy=title&sortDirection=asc&pageSize=3&pageNumber=1")
        expect(post.body).toStrictEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 3,
            totalCount: 5,
            items: [
                {
                    "id" : expect.any(String),
                    "title": "Anastasia",
                    "shortDescription": "Test description",
                    "content": "Test content",
                    "blogId": blogId.body.id,
                    "blogName" : blogId.body.name,
                    "createdAt" : expect.any(String)
                },
                {
                    "id" : expect.any(String),
                    "title": "Banastasia",
                    "shortDescription": "Test description",
                    "content": "Test content",
                    "blogId": blogId.body.id,
                    "blogName" : blogId.body.name,
                    "createdAt" : expect.any(String)
                },
                {
                    "id" : expect.any(String),
                    "title": "Cbanastasia",
                    "shortDescription": "Test description",
                    "content": "Test content",
                    "blogId": blogId.body.id,
                    "blogName" : blogId.body.name,
                    "createdAt" : expect.any(String)
                },

            ]
        })
    })



    //DELETE ALL DATA

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })

})