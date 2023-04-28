import {UsersDbRepository} from "../repositories/users-db-repository";
import {User} from "../types/types";

export class UsersService {

    constructor(protected usersDbRepository : UsersDbRepository) {

    }

    async getUser(term : string) : Promise <User | null>{

        return await this.usersDbRepository.getUser(term)

    }

    async getUsers() : Promise <User[]>{

        return await this.usersDbRepository.getUsers()

    }

    async deleteUser(term : string) : Promise<boolean>{

        return await this.usersDbRepository.deleteUser(term)

    }

    async createUser(user : User) : Promise<User | null>{

        const newUser = {

            id : (+new Date()).toString(),
            firstName : user.firstName,
            lastName : user.lastName,
            phoneNumber : user.phoneNumber

        }
        return await this.usersDbRepository.createUser(newUser)

    }

}