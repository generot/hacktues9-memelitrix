let button = document.getElementById('auth-submit');
let username = document.getElementById('username');
let password = document.getElementById('password');
let confirmPassword = document.getElementById('confirm-password');

button.onclick = () => {
    if (Notification.permission === "default") {
        Notification.requestPermission().then(perm => {
            if (Notification.permission === "granted") {
                regWorker().catch(err => console.error(err));
            } else {
                alert("Please allow notifications.");
            }
        });
    }

    else if (Notification.permission === "granted") {
        regWorker().catch(err => console.error(err));
    }

    else { alert("Please allow notifications."); }
}
