
export const paginationHelpers = {
    //searchNameTerm
    //pageSize, default - 10
    pageSize (pageSize : string | undefined) : number {
        if (!pageSize){
            return 10;
        } else {
            return +pageSize;
        }
    },
    //pageNumber, default - 1
    pageNumber(pageNumber : string | undefined) : number {
        if (!pageNumber){
            return 1;
        } else {
            return +pageNumber;
        }
    },
    //sortBy, default - createdAt
    sortBy (sortBy: string | undefined) : string {
        if (!sortBy){
            return "createdAt"
        } else {
            return sortBy
        }
    },
    //sortDirection, default - descending
    sortDirection (sortDirection: string | undefined) : 1 | -1 {
        if (sortDirection === "asc"){
            return 1;
        } else {
            return -1;
        }
    },
    //searchNameTerm, no default
    searchNameTerm (name : string | undefined) : string {
        if (!name){
            return "";
        } else {
            //count matches
            return name;
        }
    },
    searchLoginTerm (login : string | undefined) : string {
        if (!login){
            return "";
        } else {
            //count matches
            return login;
        }
    },
    searchEmailTerm (email : string | undefined) : string {
        if (!email){
            return "";
        } else {
            //count matches
            return email;
        }
    }
}