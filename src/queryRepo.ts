import {Blog, Paginator, Post, User, Comment, CommentViewModel, Like, LikeView, PostView} from "./types/types";
import {BlogModelClass, CommentModelClass, PostModelClass, UserModelClass} from "./types/models";

import {likesRepository, usersRepository} from "./compositon-root";
import {raw} from "express";

export class QueryRepository {
    async PaginatorForBlogs(PageCount: number, PageSize: number, Page: number, sortBy: string, sortDirection: 1 | -1, searchNameTerm: string): Promise<Blog[]> {
        const skipSize: number = PageSize * (Page - 1)
        return BlogModelClass
            .find({name: {$regex: searchNameTerm, $options: 'i'}}, {_id: 0, __v: 0})
            .sort({[sortBy]: sortDirection})
            .skip(skipSize)
            .limit(PageSize)
            .lean()
    }
    async PaginatorForPosts(PageCount: number, PageSize: number, Page: number, sortBy: string, sortDirection: 1 | -1): Promise<Post[]> {
        const skipSize: number = PageSize * (Page - 1)
        return PostModelClass
            .find({},{_id: 0, __v: 0})
            .sort({[sortBy]: sortDirection})
            .skip(skipSize)
            .limit(PageSize)
            .lean()
    }
    async PaginatorForCommentsByBlogId(PageCount: number, PageSize: number, Page: number, sortBy: string, sortDirection: 1 | -1, postId : string): Promise<Comment[]> {
        const skipSize: number = PageSize * (Page - 1)
        return CommentModelClass
            .find({postId : postId}, {_id: 0, __v: 0})
            .sort({[sortBy]: sortDirection})
            .skip(skipSize)
            .limit(PageSize)
            .lean()
    }
    async PaginatorForPostsByBlogId(PageCount: number, PageSize: number, Page: number, sortBy: string, sortDirection: 1 | -1, blogId: string): Promise<Post[]> {
        const skipSize: number = PageSize * (Page - 1)
        return PostModelClass
            .find({blogId: blogId}, {_id: 0, __v: 0})
            .sort({[sortBy]: sortDirection})
            .skip(skipSize)
            .limit(PageSize)
            .lean()
    }
    async PaginatorForUsers(PageCount: number, PageSize: number, Page: number, sortBy: string, sortDirection: 1 | -1, searchLoginTerm: string, searchEmailTerm: string): Promise<User[]> {
        const skipSize: number = PageSize * (Page - 1)
        return UserModelClass
            .find({
                    $or: [
                        {login: {$regex: searchLoginTerm, $options: 'i'}},
                        {email: {$regex: searchEmailTerm, $options: 'i'}}
                    ]
            }, {_id: 0, __v: 0, password : 0, confirmedCode : 0})
            .sort({[sortBy]: sortDirection})
            .skip(skipSize)
            .limit(PageSize)
            .lean()
    }
    async PaginationForm(PageCount: number, PageSize: number, Page: number, total: number, Items: Post[] | Blog [] | User[] | Comment[] | any): Promise<Paginator> {
        return  {
            pagesCount: PageCount,
            page: Page,
            pageSize: PageSize,
            totalCount: total,
            items: Items
        }
    }

    //GET 3 LAST LIKES

    async getLastLikes(id : string) : Promise<LikeView[]> {
        //get all likes
        let likes : Like[] = await likesRepository.getLikesById(id)
        const like = await Promise.all(await likes
            .sort(function( a, b) {
            return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
        })
            .reverse()
            .map(async like => {
            return {
                addedAt : like.createdAt,
                userId : like.userId,
                login : await usersRepository.getLoginById(like.userId)
            }
        }).slice(0,3))
        //sort likes by created at
        return like;

    }


    //PAGINATION FOR COMMENTS. mean - set current status of user for comment

    async CommentsMapping(comments : Comment[], userId : string) {
        return Promise.all(
            comments.map(async (comment) => {

                let status = null;

                if (userId) {
                    status = await likesRepository.findStatus(comment.id, userId);
                    if (status) status = status.status
                }

                return {
                    id: comment.id,
                    content: comment.content,
                    commentatorInfo: {
                        userId: comment.commentatorInfo.userId,
                        userLogin: comment.commentatorInfo.userLogin,
                    },
                    createdAt: comment.createdAt,
                    likesInfo: {
                        likesCount: comment.likesInfo.likesCount,
                        dislikesCount: comment.likesInfo.dislikesCount,
                        myStatus: status || "None",
                    },
                };
            })
        );
    }

    //PAGINATION FOR POSTS

    async PostsMapping(posts : Post[], userId : string) {
        return await Promise.all(
            posts.map(async (post) => {
                let newestLikes = await this.getLastLikes(post.id)
                let status = null;

                if (userId) {
                    status = await likesRepository.findStatus(post.id, userId);
                    if (status) status = status.status
                }
                return {
                    id: post.id,
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt,
                    extendedLikesInfo: {
                        likesCount: post.extendedLikesInfo.likesCount,
                        dislikesCount: post.extendedLikesInfo.dislikesCount,
                        myStatus: status || "None",
                        newestLikes : newestLikes
                    }
                }
            })
        );
    }
}

export const queryRepository = new QueryRepository()