const route = "/user/login";

async function login(form) {
    let user = {
        username: form.querySelector("#usernm").value,
        password: form.querySelector("#pass").value
    }

    if(user.username.length <= 4 || user.username.length >= 25) {
        //Njakuv pop up mozhe tuka
        alert("Username must be between 4 and 25 characters.");
        return;
    }

    let query = queryStringParams(route, [["username", user.username], ["password", user.password]]);

    let response = await getFromRoute(query);

    let code = response["code"];
    let message = response["message"];

    console.log(message)

    if(code == 200){
        let obj = {
            username: response["username"],
            id: response["id"]
        };

        window.localStorage.setItem("user", JSON.stringify(obj));
        window.location.replace("/");
    }else{
        //kod za greshna parola
        alert("User or password is incorrect.");
        window.location.replace("/login");
    }
}