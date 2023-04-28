import {UserModelClass} from "../types/models";
import {User} from "../types/types";

export class UsersDbRepository {

    async getUser(term : string) : Promise<User | null>{

        return UserModelClass.findOne({$or: [
                {id: term},
                {lastName: term},
                {phoneNumber : term}
            ]}, {_id: 0, __v: 0})
            .lean()

    }

    async getUsers() : Promise <User[]>{

        return UserModelClass.find({}, {_id: 0, __v: 0}).lean()

    }

    async deleteUser(term : string) : Promise <boolean> {

        const result = await UserModelClass.deleteOne({$or: [
                {id: term},
                {lastName: term},
                {phoneNumber : term}
            ]})
        return result.deletedCount === 1

    }

    async createUser(newUser : User) : Promise<User | null>{

        await UserModelClass.insertMany(newUser)
        const user : User | null = await this.getUser(newUser.id)
        return user

    }

    async deleteAllData(){
        await UserModelClass.deleteMany({})
        return
    }

}