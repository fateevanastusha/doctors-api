import {Router} from "express";
import {doctorsController} from "../compositon-root";
import {
    firstNameCheckDoctor,
    inputValidationMiddleware,
    lastNameCheckDoctor, lastNameUserExistingCheck,
    specCheckDoctor, timeCheckSlot
} from "../middlewares/input-valudation-middleware";

export const doctorsRouter = Router()

//Get doctor

doctorsRouter.get('/:term',
    doctorsController.getDoctor.bind(doctorsController)
)

//Get doctors

doctorsRouter.get('/',
    doctorsController.getDoctors.bind(doctorsController)
)

//Delete doctor

doctorsRouter.delete('/:term',
    doctorsController.deleteDoctor.bind(doctorsController)
)

//Create doctor

doctorsRouter.post('/',
    firstNameCheckDoctor,
    lastNameCheckDoctor,
    specCheckDoctor,
    inputValidationMiddleware,
    doctorsController.createDoctor.bind(doctorsController)
)

//Add free slot to doctor

doctorsRouter.post('/slot/:term',
    timeCheckSlot,
    inputValidationMiddleware,
    doctorsController.addSlot.bind(doctorsController)
)

//Delete free slot (запись к врачу)

doctorsRouter.delete('/slot/:term',
    timeCheckSlot,
    lastNameUserExistingCheck,
    inputValidationMiddleware,
    doctorsController.deleteSlot.bind(doctorsController)
)
