import {Blog} from "../types/types";
import {BlogModelClass} from "../types/models";


export class BlogsRepository {

    async returnBlogsCount(searchNameTerm : string) : Promise<number>{
        return BlogModelClass
            .countDocuments({name: {$regex: searchNameTerm, $options : 'i'}})
    }
    //GET - return by ID
    async returnBlogById(id: string) : Promise<Blog | null>{
        const blog : Blog | null = await BlogModelClass.findOne({id: id}, {_id: 0, __v: 0})
        return blog
    }
    //DELETE - delete by ID
    async deleteBlogById(id: string) : Promise<boolean>{

        const blogInstance = await BlogModelClass.findOne({id: id});

        if(!blogInstance) return false

        await blogInstance.deleteOne()

        return true;
        //const result = await BlogModelClass.deleteOne({id: id})
        //return result.deletedCount === 1
    }
    //delete all data
    async deleteAllData(){
        const result = await BlogModelClass.deleteMany({})
        return []
    }
    //POST - create new 
    async createNewBlog(newBlog: Blog) : Promise<Blog | null>{

        const blogInstance = new BlogModelClass(newBlog)
        blogInstance.id = newBlog.id
        blogInstance.name = newBlog.name
        blogInstance.description = newBlog.description
        blogInstance.websiteUrl = newBlog.websiteUrl
        blogInstance.createdAt = newBlog.createdAt
        blogInstance.isMembership = newBlog.isMembership

        await blogInstance.save()

        //await BlogModelClass.insertMany(newBlog)
        const createdBlog = await this.returnBlogById(newBlog.id)
        if(createdBlog) {
            return createdBlog
        }
        return null
    }
    //PUT - update
    async updateBlogById(blog : Blog, id: string) : Promise <boolean>{

        const blogInstance = await BlogModelClass.findOne({id: id});

        if(!blogInstance) return false

        blogInstance.name = blog.name
        blogInstance.description = blog.description
        blogInstance.websiteUrl = blog.websiteUrl

        await blogInstance.save()

        return true;
        //const result = await BlogModelClass.updateOne({id: id}, { $set: blog})
        //return result.matchedCount === 1
    }
};

