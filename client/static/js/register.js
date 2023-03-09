const route = "/user/register"

async function register(form) {
	let user = {
		username: form.querySelector("#usernm").value,
		password: form.querySelector("#pass").value
	};

	if(user.username.length <= 4 || user.username.length >= 25){
		alert("Username must be between 4 and 25 characters.");
		window.location.replace("/register");
	}

	let response = null;

	try {
		response = await sendToRoute(user, route);
	} catch(err) {
		console.log(err);
		return;
	}

	let obj = await response.json();

	if(obj["code"] == 200) {
		//Redirect to profile
		alert("Sign up successful.");
		window.location.replace("/");
	} else {
		alert("User already exists.");
		window.location.replace("/register");
	}
}
async function verifyAndRegister(form){
	let pass = {
		password1: form.querySelector("#pass").value,
		password2: form.querySelector("#Cpass").value
	};
	if(pass.password1 == pass.password2){
		await register(form);
	}else{
		alert("Passwords don't match");
	}
}