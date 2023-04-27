import mongoose from "mongoose";
import {
    attemptsSchema,
    blogSchema,
    commentSchema, likesSchema,
    postSchema,
    refreshTokenSchema,
    refreshTokensMetaSchema,
    userSchema
} from "./schemas";


export const BlogModelClass = mongoose.model('blogs', blogSchema)
export const PostModelClass = mongoose.model('posts', postSchema)
export const UserModelClass = mongoose.model('users', userSchema)
export const CommentModelClass = mongoose.model('comments', commentSchema)
export const RefreshTokenBlackListModelClass = mongoose.model('refresh token black list', refreshTokenSchema)
export const RefreshTokensMetaModelClass = mongoose.model('refresh token meta', refreshTokensMetaSchema)
export const AttemptsModelClass = mongoose.model('attempts', attemptsSchema)
export const LikeModelClass = mongoose.model('likes', likesSchema)
