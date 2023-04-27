import {BlogsRepository} from "../repositories/blogs-db-repositiory";
import {Blog, Paginator, SortDirection} from "../types/types";
import {queryRepository} from "../queryRepo";


export class BlogsService {
    constructor(protected blogsRepository : BlogsRepository) {
    }

    //GET - return all
    async returnAllBlogs(
        PageSize: number,
        Page: number,
        sortBy : string,
        sortDirection: SortDirection,
        searchNameTerm : string)
        : Promise<Paginator>{

        const total = await this.blogsRepository.returnBlogsCount(searchNameTerm)
        const PageCount = Math.ceil( total / PageSize)
        const Items = await queryRepository.PaginatorForBlogs(
            PageCount,
            PageSize,
            Page,
            sortBy,
            sortDirection,
            searchNameTerm
        );
        return queryRepository.PaginationForm(
            PageCount,
            PageSize,
            Page,
            total,
            Items
        )
    }
    //GET - return by ID
    async returnBlogById(id: string) : Promise<Blog | null>{
        const blogById = await this.blogsRepository.returnBlogById(id)
        return blogById
    }
    //DELETE - delete by ID
    async deleteBlogById(id: string) : Promise<boolean>{
        return await this.blogsRepository.deleteBlogById(id)
    }
    //delete all data
    async deleteAllData(){
        await this.blogsRepository.deleteAllData()
    }
    //POST - create new
    async createNewBlog(blog: Blog) : Promise<Blog | null>{
        const newBlog = {
            id: (+new Date()).toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlog = await this.blogsRepository.createNewBlog(newBlog);
        return createdBlog;
    }
    //PUT - update
    async updateBlogById(blog : Blog, id: string) : Promise <boolean>{
        return await this.blogsRepository.updateBlogById(blog, id)
    }
}