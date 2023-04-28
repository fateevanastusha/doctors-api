import "reflect-metadata";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./controllers/users-controller";
import {Container} from "inversify";
import {UsersDbRepository} from "./repositories/users-db-repository";
import {DoctorsService} from "./domain/doctors-service";
import {DoctorsController} from "./controllers/doctors-controller";
import {DoctorsDbRepository} from "./repositories/doctors-db-repository";
import {NotificationService} from "./notification-service";

export const notificationService = new NotificationService()

export const usersDbRepository = new UsersDbRepository()
export const usersService = new UsersService(usersDbRepository)
export const usersController = new UsersController(usersService)

export const doctorsDbRepository = new DoctorsDbRepository()
export const doctorsService = new DoctorsService(doctorsDbRepository, notificationService)
export const doctorsController = new DoctorsController(doctorsService)

export const container = new Container();
