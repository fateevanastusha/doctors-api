import mongoose from "mongoose";
import {
    doctorSchema,
    userSchema
} from "./schemas";


export const UserModelClass = mongoose.model('users', userSchema)
export const DoctorModelClass = mongoose.model('doctors', doctorSchema)
