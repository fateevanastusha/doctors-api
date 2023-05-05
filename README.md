# doctors-api
USERS :

get all users ( send firstName, lastName, phoneNumber )
get specified user by LASTNAME, ID, PHONENUMBER
delete user
create user (there is input validation)
DOCTORS :

get all doctors
get specified doctor by LASTNAME, ID
delete doctor
create doctor (there is input validation)
create new time slot for doctor with validation of not expired time ( send time (format new Date ISO string) )
delete time slot and get a notification (2h before and 1d before) ( send time (format new Date ISO string) and ). You will get 404 error if you try make request for not existing slot.
used : nodecron for notifications, express validator, jest supertest...
