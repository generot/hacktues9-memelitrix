const HAS_API_KEY = !!localStorage.getItem("API_KEY");
if (HAS_API_KEY) window.location.href = "/map";
const API_KEY = encodeURIComponent(localStorage.getItem("API_KEY"));

const SIGN_IN = "SIGN_IN";
const SIGN_UP = "SIGN_UP";
const MODE = window.location.search.includes(SIGN_UP) ? SIGN_UP : SIGN_IN;
const LABEL = MODE === SIGN_UP ? "Sign Up" : "Sign In";

const form = document.querySelector(".auth-form");
const hint = document.querySelector(".auth-hint");
const hintLink = document.querySelector(".auth-hint > a");
const header = form.querySelector(".header");
const button = form.querySelector(".button");
const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPasswordField = document.getElementById("confirm-password-field");
const confirmPassword = document.getElementById("confirm-password");

if (MODE === SIGN_IN) {
    confirmPasswordField.remove();
    hint.innerText = "Don't have an account ";
    hintLink.innerText = "Sign Up.";
    hintLink.href = "/auth?mode=" + SIGN_UP;
    hint.appendChild(hintLink);
}

header.innerText = LABEL;
button.innerText = LABEL;

const clearPassword = () => {
    password.value = "";
    if (MODE === SIGN_UP) confirmPassword.value = "";
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (username.value.length < 4 || username.value.length > 20) {
        alert("Username must be between 4 and 20 characters!");
        username.value = "";
        clearPassword();
        return;
    }

    if (password.value.length < 4 || password.value.length > 20) {
        alert("Password must be between 4 and 20 characters!");
        clearPassword();
        return;
    }

    if (MODE === SIGN_UP && password.value !== confirmPassword.value) {
        alert("Password field and Confirm password field must match!");
        clearPassword();
        return;
    }

    const route = MODE === SIGN_UP ? "/register" : "/login";
    const resp = await getFromRoute(
        queryStringParams(route, [
            ["username", username.value],
            ["password", password.value],
        ]),
        "POST"
    );

    if (resp.code !== 200) {
        alert("Authentication failed.");
        username.value = "";
        clearPassword();
        return;
    }

    localStorage.setItem("API_KEY", resp.API_key);
    localStorage.setItem("USER_ID", resp.id);

    if (Notification.permission === "granted") {
        handleGrantedPermission();
        return;
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                handleGrantedPermission();
                return;
            }
        });
    }
    alert("Please allow notifications");

    window.location.href = "/map";
});

function handleGrantedPermission() {
    regWorker().catch((err) => console.error(err));
    window.location.href = "/map";
}
