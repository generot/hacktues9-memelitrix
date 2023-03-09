function editAfterLogin() {
    const route = "/user/verify"

    let user = JSON.parse(window.localStorage.getItem("user"));
    if(!user) return;

    getFromRoute(queryStringParams(route, [["username", user.username]]))
    .then(res => {
        if(!res.exists)
            return;

        let loginBtn = document.querySelector("#login_drop");
        let registerBtn = document.querySelector("#register_drop");
        
        if(user) {
            loginBtn.innerHTML = user.username;
            loginBtn.setAttribute("href", "/user/profile")
            
            registerBtn.innerHTML = "Sign out";
            registerBtn.signOut = true;
            registerBtn.setAttribute("href", "");
            registerBtn.setAttribute("onclick", `
                window.localStorage.clear();
                window.location.replace("/");
            `);
        }
    });
}