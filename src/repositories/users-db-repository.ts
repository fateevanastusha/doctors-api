import {User} from "../types/types";
import {UserModelClass} from "../types/models";

export class UsersRepository {

    //COUNT USERS WITH SEARCH LOGIN TERM AND SEARCH EMAIL TERM

    async returnUsersCount(searchLoginTerm : string, searchEmailTerm : string) : Promise<number>{
        return UserModelClass.countDocuments({
                $or: [
                    {login: {$regex: searchLoginTerm, $options: 'i'}},
                    {email: {$regex: searchEmailTerm, $options: 'i'}}
                ]
        })
    }

    //GET USER BY ID

    async returnUserById(id : string) : Promise <User | null> {
       return UserModelClass
            .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0})

    }

    async getLoginById(id : string) : Promise <string> {
        const user = await UserModelClass
            .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0})
        if (!user) return 'login'
        return user.login
    }

    //GET USER BY FIELD

    async returnUserByField(field : string) : Promise <User | null> {
        const user = await UserModelClass
            .findOne({$or : [{login: field} , {email: field}]})
        return user


    }

    //GET USER BY LOGIN

    async returnUserByLogin(login : string) : Promise <User | null> {
        const user =  UserModelClass
            .findOne({login : login}, {_id: 0, __v: 0})
        return user

    }

    //GET USER BY EMAIL OR LOGIN

    async returnUserByEmail(email : string) : Promise <User | null> {
        const user =  UserModelClass
            .findOne({email : email},{_id: 0, __v: 0})
        return user

    }

    //CREATE NEW USER

    async createNewUser(newUser : User) : Promise <User | null> {
        await UserModelClass.insertMany([newUser])
        const updatedUser = await this.returnUserById(newUser.id)
        if (updatedUser) {
            return updatedUser
        }
        return null
    }

    //CHANGE PASSWORD

    async changeUserPassword(code : string, password : string) : Promise <boolean> {
        const result = await UserModelClass.updateOne({confirmedCode: code}, {$set :
                {
                    password: password
                }
        })
        return result.matchedCount === 1
    }

    //DELETE USER BY ID

    async deleteUserById(id: string) : Promise<boolean>{
        const result = await UserModelClass.deleteOne({id: id, __v: 0})
        return result.deletedCount === 1
    }

    //CHECK FOR CONFIRMATION CODE

    async checkForConfirmationCode (confirmedCode : string) : Promise<boolean> {
        const user = await UserModelClass.findOne({confirmedCode : confirmedCode})
        return user !== null
    }

    //CHANGE CONFIRMATION STATUS

    async changeConfirmedStatus (confirmedCode : string) : Promise<boolean> {
        const status = await UserModelClass.updateOne(
            {confirmedCode : confirmedCode},
            { $set : {
                    isConfirmed : true
                }
            })
        return status.matchedCount === 1
    }

    //CHANGE CONFIRMATION CODE

    async changeConfirmationCode (confirmationCode : string, email : string) : Promise <boolean> {
        const status = await UserModelClass.updateOne(
            {email : email},
            { $set : {
                    confirmedCode : confirmationCode
                }
            })
        return status.matchedCount === 1
    }

    //CHECK FOR CONFIRMED ACCOUNT

    async checkForConfirmedAccountByEmailOrCode (emailOrCode : string) : Promise <boolean> {
        const user = await UserModelClass.findOne({$or: [{email: emailOrCode}, {confirmedCode: emailOrCode}]})
        if (user?.isConfirmed) {
            return true
        } else {
            return false
        }
    }

    //DELETE ALL DATA

    async deleteAllData(){
        await UserModelClass.deleteMany({})
        return []
    }

}

