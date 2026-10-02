import { api } from '@/services/api'

let userRole: Array<{ user_id: number }> = [];
let rolePermitionList: Array<{ role_id: number }> = [];

init();
async function init() {
     userRole = await api.get<unknown, Array<{ user_id: number }>>('/user-roles');
     rolePermitionList = await api.get<unknown, Array<{ role_id: number }>>('/role-permitions'); 
}

export function can(user_id: number | string){
    
    const roles = userRole.filter((e) => e.user_id == user_id);
    if(!roles) return false;
    
    const result: Array<any> = [];
    
    roles.forEach( (e, i) => {
        const response = rolePermition(e.role_id);
        if(!response[i]) return;
        result.push(response.map((e)=>e?.permition?.name)); 
    });
    
    return result;
}

 function rolePermition(role_id: any){
    return rolePermitionList.filter((e) => e.role_id == role_id);
}