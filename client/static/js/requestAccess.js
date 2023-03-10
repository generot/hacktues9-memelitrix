window.onload = () => {
    // (A1) ASK FOR PERMISSION
    if (Notification.permission === "default") {
        Notification.requestPermission().then(perm => {
            if (Notification.permission === "granted") {
                regWorker().catch(err => console.error(err));
            } else {
                alert("Please allow notifications.");
            }
        });
    }

    // (A2) GRANTED
    else if (Notification.permission === "granted") {
        regWorker().catch(err => console.error(err));
    }

    // (A3) DENIED
    else { alert("Please allow notifications."); }
}