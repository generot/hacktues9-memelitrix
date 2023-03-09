

const form = document.getElementById('register_form');
const username_field = document.getElementById('username');
const password_field = document.getElementById('password');
const confirm_password_field = document.getElementById('confirm_password');

if(localStorage.getItem("API_KEY")){
	window.location.href = "/map";
}

function clear_form(){
	username_field.value = '';
	password_field.value='';
	confirm_password_field.value='';
}

form.addEventListener("submit", async function(event){
	event.preventDefault();
	var username = username_field.value;
	var password = password_field.value;
	var confirm_password = confirm_password_field.value;
	if(password !== confirm_password ){
		alert("password missmatch");
		clear_form();
		return;
	}

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
	
	var resp = await getFromRoute(queryStringParams("/register", [["username", username], ["password", password]]), "POST");
	localStorage.setItem("API_KEY", resp.API_key);
    localStorage.setItem("USER_ID", resp.id);
    window.location.href = "/map";

})