const route = "/tasks/accept";

function openTask(){
    document.getElementById("task-create").style.display = "inline";
    document.getElementById("task-create").style.display = "inline";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-reward").value = "";
}

function closeTask() {
    document.getElementById("task-create").style.display = "none";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-reward").value = "";
}

function createTask(){
    let title = document.querySelector("#task-title");
    let desc = document.querySelector("#task-desc");
    let reward = document.querySelector("#task-reward").value;

    reward = reward.replace(/\D/, "");

    adPublish(title.value, desc.value, reward);

    document.getElementById("task-create").style.display = "none";
    document.getElementById("task-title").value = "";
    document.getElementById("task-reward").value = "";
    document.getElementById("task-desc").value = "";
}

async function toggleProfileTask(thisTask) {
    if(!taskOnFocus) {
        openTaskMenu(thisTask);
    } else {
        let obj = taskOnFocus.querySelector("#text2");

        if (map.getLayer("route")) {
            map.removeLayer("route");
            map.removeSource("route");
        }

        obj.classList.remove("container-text-break");
        obj.classList.add("container-text");

        if(prevMarker) prevMarker.remove();

        prevMarker = null;
        taskOnFocus = null;
    }
}

async function openTaskMenu(thisTask) {
    if(prevMarker){
        prevMarker.remove();
    }
    
    if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
    }

    taskOnFocus = thisTask;

    let obj = taskOnFocus.querySelector("#text2");
    let dplay = document.getElementById("task-accept");

    if(obj.getAttribute("takenby") != "") {
        return;
    }
    
    let marker = {
        lon: obj.getAttribute("locationlong"),
        lat: obj.getAttribute("locationlat")
    };

    obj.classList.remove("container-text");
    obj.classList.add("container-text-break");

    prevMarker = placeMarker(map, marker);

    coords = await getCoords();

    var long = coords.longitude;
    var lat = coords.latitude;

    currPos = new tt.Marker({
        dragable : false
    })
    .setLngLat([long, lat]);

    makeRoute(map, currPos, prevMarker);

    if(dplay) dplay.style.display = "inline";
}

function closeTaskMenu() {
    let obj = taskOnFocus.querySelector("#text2");
    let dplay = document.getElementById("task-accept");
    taskOnFocus = null;

    obj.classList.remove("container-text-break");
    obj.classList.add("container-text");

    if(prevMarker) prevMarker.remove();
    if(dplay) dplay.style.display = "none";
}

function acceptTask() {
    let obj = taskOnFocus.querySelector("#text2");
    let user = JSON.parse(window.localStorage.getItem("user"));

    if(prevMarker) prevMarker.remove();
    document.getElementById("task-accept").style.display = "none";

    obj.classList.remove("container-text-break");
    obj.classList.add("container-text");

    taskOnFocus.classList.remove("adds-small-container");
    taskOnFocus.classList.add("adds-small-container-taken");

    taskOnFocus.querySelector("#title").classList.remove("hidden-button");
    taskOnFocus.querySelector("#title").classList.add("hidden-button-taken");
    taskOnFocus.querySelector("#title").setAttribute("onclick", "");

    taskOnFocus.querySelector("#text2").classList.remove("container-text");
    taskOnFocus.querySelector("#text2").classList.add("container-text-taken");

    let taskId = taskOnFocus.getAttribute("task-id");
    taskOnFocus = null;
    
    sendToRoute({
        id: taskId,
        uid: user.id
    }, route);
}