let auth_el = document.getElementById("nav-auth");
let sign_out_el = document.getElementById("nav-sign-out");
let map_el = document.getElementById("nav-map");

let logged = localStorage.getItem("API_KEY");

if(logged != null && logged != undefined && logged != NaN){
	auth_el.style.display="none";
	map_el.style.display="inline-block";
	sign_out_el.style.display="inline-block";
}

function signout(){
	localStorage.clear();
    window.location.href = '/';
}

sign_out_el.addEventListener("click", signout);
