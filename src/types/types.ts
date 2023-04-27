import supertest from "supertest";

export type Blog = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string
    createdAt : string
    isMembership : boolean
}
export type Post = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string
    }
}

export type LikeView = {
    addedAt : string,
    userId : string,
    login : string
}

export type PostView = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes : LikeView[]
    }
}
export type User = {
    id: string,
    login : string,
    email : string,
    password: string,
    createdAt: string,
    isConfirmed: boolean,
    confirmedCode : string | null
}
export type Auth = {
    loginOrEmail : string,
    password : string
}
export type Comment = {
    id : string,
    content : string,
    commentatorInfo : {
        userId: string,
        userLogin: string
    },
    createdAt: string,
    postId : string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
    }
}

export type CommentViewModel = {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: string;
    likesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
    };
};

export type Paginator = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items : Blog[] | Post[] | User[] | Comment []
}

export type AccessToken = {
    accessToken : string
}

export type RefreshToken = {
    refreshToken : string
}

export type TokenList = {
    accessToken : string,
    refreshToken : string
}

export type RefreshTokensMeta = {
    userId : string,
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}

export type Attempts = {
    userIP: String,
    url: String,
    time: Date
}

export type Like = {
    status : string,
    userId : string,
    postOrCommentId : string,
    createdAt : string
}

export type SortDirection = 1 | -1