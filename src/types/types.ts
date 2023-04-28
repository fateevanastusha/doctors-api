export type User = {
    id : string,
    firstName : string,
    lastName : string,
    phoneNumber : string
}

export type Slot = {
    id : string,
    time : string
}

export type Doctor = {
    id : string,
    firstName : string,
    lastName : string,
    spec : string,
    slots : Slot[]
}

