# doctors api

USERS : 
1. get all users ( send firstName, lastName, phoneNumber ) 
2. get specified user by LASTNAME, ID, PHONENUMBER
3. delete user
4. create user (there is input validation)

DOCTORS : 
1. get all doctors
2. get specified doctor by LASTNAME, ID
3. delete doctor
4. create doctor (there is input validation)
5. create new time slot for doctor with validation of not expired time ( send time (format new Date ISO string) )
6. delete time slot and get a notification (2h before and 1d before) ( send time (format new Date ISO string) and ). You will get 404 error if you try make request for not existing slot.

used : nodecron for notifications, express validator, jest supertest...
