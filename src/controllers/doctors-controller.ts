import {Response, Request} from "express";
import {DoctorsService} from "../domain/doctors-service";
import {Doctor} from "../types/types";

export class DoctorsController {
    constructor(protected doctorsService : DoctorsService) {
    }

    //Get doctor

    async getDoctor(req: Request, res : Response){

        const term : string = req.params.term
        const doctor : Doctor | null = await this.doctorsService.getDoctor(term)
        if(!doctor) return res.sendStatus(404)
        return res.status(200).send(doctor)

    }

    //Get doctors

    async getDoctors(req: Request, res : Response){

        const allDoctors : Doctor[] = await this.doctorsService.getDoctors()
        return res.status(200).send(allDoctors)

    }

    //Delete doctor

    async deleteDoctor(req: Request, res : Response){

        const term = req.params.term
        const status : boolean = await this.doctorsService.deleteDoctor(term)
        if (!status) return res.sendStatus(404)
        return res.sendStatus(204)

    }

    //Create doctor

    async createDoctor(req: Request, res : Response){

        const body = req.body
        const createdDoctor : Doctor | null = await this.doctorsService.createDoctor(body)
        if (!createdDoctor) return res.sendStatus(400)
        return res.status(201).send(createdDoctor)
    }

    //Add free slot to doctor

    async addSlot(req: Request, res : Response){

        const time : string = req.body.time
        const term : string = req.params.term
        const status : boolean = await this.doctorsService.addSlot(time, term)
        if (!status) return res.sendStatus(404)
        return res.sendStatus(204)

    }

    //Delete free slot

    async deleteSlot(req: Request, res : Response){

        const time : string = req.body.time
        const term : string = req.params.term
        const userLastName : string = req.body.userLastName
        const status : boolean = await this.doctorsService.deleteSlot(time, term, userLastName)
        if (!status) return res.sendStatus(404)
        return res.sendStatus(204)

    }

    //Clear expired slots

    async clearExpiredSlots(req : Request, res : Response){

        const term : string = req.params.term
        const status : boolean = await this.doctorsService.clearFreeSlots(term)
        if (!status) return res.sendStatus(404)
        return res.sendStatus(204)

    }
}
