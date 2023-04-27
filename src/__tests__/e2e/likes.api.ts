import request from "supertest";
import {app} from "../../app";
import {runDb} from "../../db/db";

describe('likes', () => {
    jest.setTimeout(3 * 60 * 1000)
    //DELETE ALL DATA

    beforeAll(async () => {
        await runDb()
        await request(app)
            .delete('/testing/all-data')
            .expect(204)

    })

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
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id,
            "extendedLikesInfo": {
                "dislikesCount": 0,
                "likesCount": 0,
                "myStatus": "None",
                "newestLikes" : []
            }
        })
    })

    let token : any = null

    //SUCCESSFULLY AUTH

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

    let res = null

    //set dislike to post and check dislike

    it ('SET DISLIKE', async () => {
        await request(app)
            .put('/posts/' + createResponsePost.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "Dislike"
                }
            )
            .expect(204)
        res = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(res.body).toStrictEqual({
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id,
            "extendedLikesInfo": {
                "dislikesCount": 1,
                "likesCount": 0,
                "myStatus": "None",
                "newestLikes" : []
            }
        })

    })

    //set like to post and check like

    it ('SET LIKE', async () => {
        await request(app)
            .put('/posts/' + createResponsePost.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "Like"
                }
            )
            .expect(204)
        res = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(res.body).toStrictEqual({
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id,
            "extendedLikesInfo": {
                "dislikesCount": 0,
                "likesCount": 1,
                "myStatus": "None",
                "newestLikes" : [
                    {
                        addedAt : expect.any(String),
                        userId : createResponseUser.body.id,
                        login : "nastya"
                    }
                ]
            }
        })

    })

    it ('check for like', async () => {
        const post = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(post.body).toStrictEqual({
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id,
            "extendedLikesInfo": {
                "dislikesCount": 0,
                "likesCount": 1,
                "myStatus": "None",
                "newestLikes" : [
                    {
                        addedAt : expect.any(String),
                        userId : createResponseUser.body.id,
                        login : "nastya"
                    }
                ]
            }
        })
    })

    //unsuccessful like request

    it ('UNSUCCESSFUL REQUEST FOR LIKE WITH WRONG DATA', async () => {
        await request(app)
            .put('/posts/' + createResponsePost.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "not ok"
                }
            )
            .expect(400)

    })

    it ('UNSUCCESSFUL REQUEST FOR LIKE WITH NO AUTH', async () => {
        await request(app)
            .put('/posts/' + createResponsePost.body.id + '/like-status')
            .send(
                {
                    "likeStatus": "not ok"
                }
            )
            .expect(401)

    })

    it ('SET LIKE AGAIN. CHECK FOR NOT DOUBLE LIKE FROM ONE USER', async () => {
        await request(app)
            .put('/posts/' + createResponsePost.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "Like"
                }
            )
            .expect(204)
        res = await request(app)
            .get('/posts/' + createResponsePost.body.id)
        expect(res.body).toStrictEqual({
            "title": "string",
            "shortDescription": "string",
            "content": "string",
            "blogId": createResponseBlog.body.id,
            "blogName" : createResponseBlog.body.name,
            "createdAt" : expect.any(String),
            "id" : createResponsePost.body.id,
            "extendedLikesInfo": {
                "dislikesCount": 0,
                "likesCount": 1,
                "myStatus": "None",
                "newestLikes" : [
                    {
                        addedAt : expect.any(String),
                        userId : createResponseUser.body.id,
                        login : "nastya"
                    }
                ]

            }
        })

    })


    //get all posts and check likes

    it('CHECK ALL POSTS WITH NEWEST LIKES', async () => {
        res = await request(app)
            .get('/posts')
            .expect(200)
        expect(res.body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [
                {
                    "title": "string",
                    "shortDescription": "string",
                    "content": "string",
                    "blogId": createResponseBlog.body.id,
                    "blogName" : createResponseBlog.body.name,
                    "createdAt" : expect.any(String),
                    "id" : createResponsePost.body.id,
                    "extendedLikesInfo": {
                        "dislikesCount": 0,
                        "likesCount": 1,
                        "myStatus": "None",
                        "newestLikes" : [
                            {
                                addedAt : expect.any(String),
                                userId : createResponseUser.body.id,
                                login : createResponseUser.body.login
                            }
                        ]
                    }
                }
            ]
        })
    })




    //create comment

    let createResponseComment : any

    it('CREATE NEW COMMENT', async () => {
        createResponseComment = await request(app)
            .post('/posts/' + createResponsePost.body.id + '/comments')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send({
                content : "content of comment 111111111111"
            })
            .expect(201)
        expect(createResponseComment.body).toStrictEqual({
            commentatorInfo : {
                userId : createResponseUser.body.id,
                userLogin : "nastyas"
            },
            content : "content of comment 111111111111",
            createdAt : expect.any(String),
            id : expect.any(String),
            likesInfo : {
                dislikesCount : 0,
                likesCount : 0,
                myStatus : "None"
            }

        })
    })

    //set dislike to comment and check dislike

    it ('SET WRONG STATUS', async () => {
        await request(app)
            .put('/comments/' + createResponseComment.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "WRONG DATA"
                }
            )
            .expect(400)
    })

    //send wrong status

    it ('SET LIKE TO COMMENT', async () => {
        await request(app)
            .put('/comments/' + createResponseComment.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "Like"
                }
            )
            .expect(204)
        res = await request(app)
            .get('/comments/' + createResponseComment.body.id)
            .set("Authorization", "bearer " +  token.body.accessToken)
        expect(res.body).toStrictEqual({
            commentatorInfo : {
                userId : createResponseUser.body.id,
                userLogin : "nastya"
            },
            content : "content of comment 111111111111",
            createdAt : expect.any(String),
            id : expect.any(String),
            likesInfo : {
                dislikesCount : 0,
                likesCount : 1,
                myStatus : "Like"
            }
        })
    })

    //set like to comment and check like

    it ('SET LIKE TO COMMENT', async () => {
        await request(app)
            .put('/comments/' + createResponseComment.body.id + '/like-status')
            .set("Authorization", "bearer " +  token.body.accessToken)
            .send(
                {
                    "likeStatus": "Like"
                }
            )
            .expect(204)
        res = await request(app)
            .get('/comments/' + createResponseComment.body.id)
            .set("Authorization", "bearer " +  token.body.accessToken)
        expect(res.body).toStrictEqual({
            commentatorInfo : {
                userId : createResponseUser.body.id,
                userLogin : "nastya"
            },
            content : "content of comment 111111111111",
            createdAt : expect.any(String),
            id : expect.any(String),
            likesInfo : {
                dislikesCount : 0,
                likesCount : 1,
                myStatus : "Like"
            }
        })
    })

    //check my status without auth

    it ('CHECK STATUS', async () => {
        res = await request(app)
            .get('/comments/' + createResponseComment.body.id)
        expect(res.body).toStrictEqual({
            commentatorInfo : {
                userId : createResponseUser.body.id,
                userLogin : "nastya"
            },
            content : "content of comment 111111111111",
            createdAt : expect.any(String),
            id : expect.any(String),
            likesInfo : {
                dislikesCount : 0,
                likesCount : 1,
                myStatus : "None"
            }
        })
    })

    //get all comments and check likes

    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
            .expect(204)

    })

})