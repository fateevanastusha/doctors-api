import {DoctorsDbRepository} from "../repositories/doctors-db-repository";
import {Doctor, Slot} from "../types/types";
import {NotificationService} from "../notification-service";

export class DoctorsService {
    constructor(protected doctorsDbRepository : DoctorsDbRepository, protected notificationService : NotificationService) {

    }

    async getDoctor(term : string) : Promise <Doctor | null>{

        return await this.doctorsDbRepository.getDoctor(term)

    }

    //Get doctors

    async getDoctors() : Promise <Doctor[]>{

        return await this.doctorsDbRepository.getDoctors()

    }

    //Delete doctor

    async deleteDoctor(term : string) : Promise<boolean>{

        return await this.doctorsDbRepository.deleteDoctor(term)

    }

    //Create doctor

    async createDoctor(body : Doctor) : Promise <Doctor | null>{

        const newDoctor : Doctor = {
            id : (+new Date()).toString(),
            firstName : body.firstName,
            lastName : body.lastName,
            spec : body.spec,
            slots : []
        }
        return await this.doctorsDbRepository.createDoctor(newDoctor)

    }

    //Add free slot to doctor

    async addSlot(time : string, term : string) : Promise <boolean> {


        const doctor : Doctor | null = await this.doctorsDbRepository.getDoctor(term)
        if (!doctor) return false
        const allSlots : Slot[] = doctor.slots
        const slot : Slot = {
            id : (+new Date()).toString(),
            time : time
        }
        const newSlots = allSlots.push(slot)
        return await this.doctorsDbRepository.addSlot(slot, term)

    }

    //Delete free slot

    async deleteSlot(time : string, term : string, userLastName : string) : Promise <boolean>{

        let doctor : Doctor | null = await this.doctorsDbRepository.getDoctor(term)
        if (!doctor) return false
        let slots = doctor.slots
        let slots1 = slots.filter(a => a.time !== time)
        if (slots1.length === slots.length) return false

        //перед удалением сделаем задачу для напоминания

        await this.notificationService.makeTask(doctor, time, userLastName)

        return await this.doctorsDbRepository.deleteSlot(slots1, term)


    }
}