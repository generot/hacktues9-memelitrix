
function usersCreate(user) {    
    let container = document.querySelector("#leaderboard-js");
    let tmp = document.createElement("template");
    let temp =  `
    <li>
    <mark>${user.name}</mark>
    <small>${user.points}<small>
    </li>
    `
    tmp.innerHTML = temp;
    container.appendChild(tmp.content.firstElementChild);
}
async function usersFetch() {
    const route = "/user/fetchAll";
    let jsonObj = await getFromRoute(route);
    
    let users = jsonObj.users;
    users = users.sort((u1,u2)=>{
        return u2.points-u1.points;
    });

    for(let user of users) {
        usersCreate(user);
    }
}