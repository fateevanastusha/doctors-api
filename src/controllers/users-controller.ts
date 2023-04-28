import {Response, Request} from "express";
import {UsersService} from "../domain/users-service";
import {User} from "../types/types";

export class UsersController {

    constructor(protected usersService : UsersService) {
    }

    async getUser(req: Request, res: Response){

        const term = req.params.term
        console.log(term)
        const user : User | null = await this.usersService.getUser(term)
        console.log(user)
        if (!user) return res.sendStatus(404)
        return res.status(200).send(user)

    }

    async getUsers(req: Request, res: Response){

        const allUsers : User[] = await this.usersService.getUsers()
        return res.status(200).send(allUsers)

    }

    async deleteUser(req: Request, res: Response){

        const term = req.params.term
        const status : boolean = await this.usersService.deleteUser(term)
        if(!status) return  res.sendStatus(404)
        return res.sendStatus(204)

    }

    async createUser(req: Request, res: Response){

        const user = req.body
        const newUser : User | null = await this.usersService.createUser(user)
        res.status(201).send(newUser)

    }

}