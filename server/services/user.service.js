import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export const getAllUserEmail = async () =>{
    const{data,error} = await supabaseAdmin.auth.admin.listUsers({
        page:1,
        perPage:1000
    });


    if(error){
        throw error
    }

    return data.users.map(users => users.email).filter(Boolean);
}
