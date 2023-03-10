let login_el = document.getElementById("login_drop");
let register_el = document.getElementById("register_drop");

let sign_out_el = document.getElementById("sign_drop");

let logged = localStorage.getItem("API_KEY");

console.log(logged);
if(logged != null && logged != undefined && logged != NaN){
	sign_out_el.style.display="inline-block";
	login_el.style.display="none";
	register_el.style.display="none";
}

function signout(){
	localStorage.clear();
}

sign_out_el.addEventListener("click", signout);
