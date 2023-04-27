import {Request, Response} from "express";
import {paginationHelpers} from "../helpers/pagination-helpers";
import {SortDirection} from "mongodb";
import {UsersService} from "../domain/users-service";
import {User} from "../types/types";

export class UsersController {
    constructor(protected usersService : UsersService) {}
    //GET ALL USERS WITH AUTH
    async getAllUsers(req: Request, res: Response){
        let pageSize : number = paginationHelpers.pageSize(<string>req.query.pageSize)
        let pageNumber : number = paginationHelpers.pageNumber(<string>req.query.pageNumber)
        let sortBy : string = paginationHelpers.sortBy(<string>req.query.sortBy)
        let sortDirection : SortDirection = paginationHelpers.sortDirection(<string>req.query.sortDirection)
        let searchLoginTerm : string = paginationHelpers.searchLoginTerm(<string>req.query.searchLoginTerm)
        let searchEmailTerm : string = paginationHelpers.searchEmailTerm(<string>req.query.searchEmailTerm)
        const allUsers = await this.usersService.getAllUsers(pageSize, pageNumber, sortBy, sortDirection,searchLoginTerm, searchEmailTerm);
        res.status(200).send(allUsers)
    }
    //POST USER WITH AUTH
    async createNewUser(req: Request, res: Response){
        const newUser : User | null = await this.usersService.createNewUser(req.body);
        if (!newUser) {
            res.sendStatus(404)
        } else {
            res.status(201).send(newUser)
        }
    }
    //DELETE USER BY ID WITH AUTH
    async deleteUser(req: Request, res: Response){
        const status : boolean = await this.usersService.deleteUserById(req.params.id)
        if (status) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}