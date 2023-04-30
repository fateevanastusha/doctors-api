import {DoctorModelClass} from "../types/models";
import {Doctor, Slot} from "../types/types";

export class DoctorsDbRepository {

    async getDoctor(term : string) : Promise <Doctor | null>{

        return await DoctorModelClass.findOne({$or: [
                {id: term},
                {lastName: term},
            ]}, {_id: 0, __v: 0, slots : {_id : 0}})
            .lean()

    }

    //Get doctors

    async getDoctors() : Promise<Doctor[]>{

        return await DoctorModelClass.find({},{_id: 0, __v: 0, slots : {_id : 0}}).lean()

    }

    //Delete doctor

    async deleteDoctor(term : string) : Promise <boolean>{

        const result = await DoctorModelClass.deleteOne({$or: [
            {id: term},
            {lastName: term},
        ]})
        return result.deletedCount === 1

    }

    //Create doctor

    async createDoctor(newDoctor : Doctor) : Promise <Doctor | null>{

        await DoctorModelClass.insertMany(newDoctor)
        const doctor : Doctor | null = await this.getDoctor(newDoctor.id)
        return doctor

    }

    //Add free slot to doctor

    async addSlot(slot : Slot[], term : string) : Promise <boolean>{

        const status = await DoctorModelClass.updateOne({$or: [
                {id: term},
                {lastName: term},
            ]}, {
            $set : {
                slots : slot
            }
        })
        return status.matchedCount === 1

    }

    //Delete free slot

    async deleteSlot(slots : Slot[], term : string) : Promise <boolean> {

        const status = await DoctorModelClass.updateOne({$or: [
                {id: term},
                {lastName: term},
            ]}, {
            $set : {
                slots : slots
            }
        })
        return status.matchedCount === 1

    }

    //Delete all data

    async deleteAllData(){

        await DoctorModelClass.deleteMany({})
        return
    }
}