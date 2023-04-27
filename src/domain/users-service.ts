import {Paginator, User, SortDirection} from "../types/types";
import {queryRepository} from "../queryRepo";
import bcrypt from "bcrypt"
import {UsersRepository} from "../repositories/users-db-repository";

export class UsersService {
    constructor(protected usersRepository : UsersRepository) {
    }
    //GET ALL USERS
    async getAllUsers(PageSize: number, Page: number, sortBy : string, sortDirection: SortDirection, searchLoginTerm : string, searchEmailTerm: string) : Promise<Paginator>{
        //add pagination
        const total = await this.usersRepository.returnUsersCount(searchLoginTerm, searchEmailTerm);
        const PageCount = Math.ceil( total / PageSize);
        const Items : User[] = await queryRepository.PaginatorForUsers(PageCount, PageSize, Page, sortBy, sortDirection, searchLoginTerm, searchEmailTerm);
        return queryRepository.PaginationForm(PageCount, PageSize, Page, total, Items)
    }
    //GET USER BY ID
    async getUserById(id : string) : Promise <User | null> {
        return await this.usersRepository.returnUserById(id)
    }
    //CREATE NEW USER
    async createNewUser(user : User, isConfirmed : boolean = true, confirmationCode : null | string = null) : Promise<User | null>{
        const hash = bcrypt.hashSync(user.password, 10, )
        const newUser =  {
            id: (+new Date()).toString(),
            login: user.login,
            email: user.email,
            password : hash,
            createdAt: new Date().toISOString(),
            isConfirmed: isConfirmed,
            confirmedCode : confirmationCode
        }
        const createdUser = await this.usersRepository.createNewUser(newUser)
        return createdUser
    }
    //CHANGE PASSWORD
    async changeUserPassword(code : string, password : string) : Promise<boolean>{
        const hash = bcrypt.hashSync(password, 10, )
        return await this.usersRepository.changeUserPassword(code, hash)
    }

    //DELETE BY ID
    async deleteUserById(id: string) : Promise<boolean>{
        return await this.usersRepository.deleteUserById(id)
    }
    //DELETE ALL DATA
    async deleteAllData(){
        await this.usersRepository.deleteAllData()
    }
}
