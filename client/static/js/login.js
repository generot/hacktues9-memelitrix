<<<<<<< HEAD
const form = document.getElementById('login_form');
const username_field = document.getElementById('username');
const password_field = document.getElementById('password');


if(localStorage.getItem("API_KEY")){
	window.location.href = "/map";
}


function clear_form(){
	username_field.value = '';
	password_field.value='';
}

form.addEventListener("submit", async function(event){
	event.preventDefault();
	var username = username_field.value;
	var password = password_field.value;;

	if(username.length <= 4 || username.length >= 25){
			alert("Username must be between 4 and 25 characters.");
		 	clear_form();
			return;
	}

	if(password.length <= 4 || password.length >= 25){
		alert("Password must be between 4 and 25 characters.");
		clear_form();
		return;
	}	

	var resp = await getFromRoute(queryStringParams("/login", [["username", username], ["password", password]]), "POST");
    
	if(resp == "200"){
		localStorage.setItem("API_KEY", resp.API_key);
		localStorage.setItem("USER_ID", resp.id);
    		window.location.href = "/map";
	}else{
		alert("Username and password combination doesn't match a profile");
		clear_form();
	}

})
=======
const form = document.getElementById('login_form');
const username_field = document.getElementById('username');
const password_field = document.getElementById('password');


if(localStorage.getItem("API_KEY")){
	window.location.href = "/map";
}


function clear_form(){
	username_field.value = '';
	password_field.value='';
}

form.addEventListener("submit", async function(event){
	event.preventDefault();
	var username = username_field.value;
	var password = password_field.value;;

	if(username.length <= 4 || username.length >= 25){
			alert("Username must be between 4 and 25 characters.");
		 	clear_form();
			return;
	}

	if(password.length <= 4 || password.length >= 25){
		alert("Password must be between 4 and 25 characters.");
		clear_form();
		return;
	}	

	var resp = await getFromRoute(queryStringParams("/login", [["username", username], ["password", password]]), "POST");
    
	if(resp.code == 200){
		localStorage.setItem("API_KEY", resp.API_key);
		localStorage.setItem("USER_ID", resp.id);
		window.location.href = "/map";
	}else{
		alert("Username and password combination doesn't match a profile");
		clear_form();
	}

})
>>>>>>> 5b75957cde4d8ec1317c8981ad354a2541c5fcd6
