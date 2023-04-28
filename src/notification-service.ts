import moment from "moment-timezone";
import {Doctor} from "./types/types";

const cron = require('node-cron')

export class NotificationService {
    async makeTask(doctor : Doctor, time : string, userName : string){
        const twoHoursBeforeTime = moment(time).subtract(2, "hours");
        const oneDayBeforeTime = moment(time).subtract(1, "day");
        //За два часа до времени
        cron.schedule(
            twoHoursBeforeTime.format("m H D M d"),
            () => {
                this.sendReminder(`${userName} через 2 часа ваш приём`);
            },
            {
                scheduled: true,
                timezone: "Europe/Moscow",
            }
        );
        // За 1 день до времени
        cron.schedule(
            oneDayBeforeTime.format("m H D M d"),
            () => {
                this.sendReminder(`${userName} через 1 день ваш приём`);
            },
            {
                scheduled: true,
                timezone: "Europe/Moscow",
            }
        );
    }
    // Отправляем сообщение
    async sendReminder(message : string ){
        console.log(`Напоминание : ${message} у врача`)
    }

}
