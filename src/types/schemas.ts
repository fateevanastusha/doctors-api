import mongoose from "mongoose";
import {
    Doctor, Slot,
    User
} from "./types";


export const userSchema = new mongoose.Schema<User>( {
    id : String,
    firstName : String,
    lastName : String,
    phoneNumber : String
});

export const doctorSchema = new mongoose.Schema<Doctor>({
    id : String,
    firstName : String,
    lastName : String,
    spec : String,
    slots : [{ id : String, time : String}]
})

