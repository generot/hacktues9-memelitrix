const auth_guard = () => {
    if(!localStorage.getItem("API_KEY")){
        window.location.href = "/login";
    }
}