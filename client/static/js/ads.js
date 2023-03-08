function adCreate(taskJson, deletable = false) {
    let match = taskJson["taken_by"] == "";

    let contClass = match ? "adds-small-container" : "adds-small-container-taken";
    let btnClass = match ? "hidden-button" : "hidden-button-taken";
    let txtClass = match ? "container-text" : "container-text-taken";

    const template = `
    <div class = "${contClass}">
        <!--<title id="ad-title">${taskJson.title}</title>-->
        <button class="${btnClass} task-open-button" onclick="openTaskMenu(this.parentElement);" id="title" tl="${taskJson.title}">${taskJson.title}(${taskJson.reward} €)</button>\n`
        + (deletable ? `<button class="${btnClass}" style="color:red;float:right;vertical-align:text-top;font-size: 1.2em;top:-100px;text-decoration:none !important;" onclick="adRemove(this)">X</button>\n` : `\n`)
        + (deletable && !match ? `<button class="${btnClass}" style="color:green;float:right;vertical-align:text-top;font-size: 1.2em;top:-100px;text-decoration:none !important;;" onclick="adComplete(this)">✓</button>\n`: `\n`)
        + `<div class="${txtClass}" id="text2" name="deaznam" locationlong="${taskJson.location[0]}" locationlat=${taskJson.location[1]} takenby=${taskJson.taken_by}>
            <span>${taskJson.description}</span>
        </div>
    </div>
    `

    let tmp = document.createElement("template");
    let container = document.querySelector("#bigCont");

    tmp.innerHTML = template;
    tmp.content.firstElementChild.setAttribute("task-id", taskJson.id);

    if(deletable) {
        let button = tmp.content.firstElementChild.querySelector("#title");
        button.setAttribute("onclick", "");
    }
    
    container.appendChild(tmp.content.firstElementChild);
}

async function adComplete(ad) {
    const route = "/tasks/complete";

    let parent = ad.parentElement;
    let title_ = parent.querySelector("#title").getAttribute("tl");

    parent.remove();

    await sendToRoute({
        title: title_
    }, route);
}

async function adRemove(ad) {
    const route = "/tasks/remove";
    let user = JSON.parse(window.localStorage.getItem("user"));

    console.log(ad.parentElement);

    let parent = ad.parentElement;
    let title_ = parent.querySelector("#title").getAttribute("tl");
    console.log(title_);

    if(!user) {
        return null;
    }

    parent.remove();

    let resp = await sendToRoute({
        title: title_,
        uid: user["id"]
    }, route);
}

function getDistance(lon1, lat1, lon2, lat2){
    const R = 6371e3;

    const f1 = lat1 * Math.PI/180;
    const f2 = lat2 * Math.PI/180;

    const df = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(df/2) * Math.sin(df/2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;

    return d;
}

async function adFetch() {
    const route = "/tasks/get";

    let user = JSON.parse(window.localStorage.getItem("user"));
    let jsonObj = await getFromRoute(route);

    if(!user) {
        alert("You're not logged in.");
        return null;
    }

    if(jsonObj.code != 200) {
        alert("Internal server error.");
        return null;
    }

    let ads = jsonObj.ads;
    let startloc = await getCoords();
    let startlocation = [startloc.longitude, startloc.latitude];

    ads = ads.sort((loc1, loc2)=>{
        let location1 = loc1.location;
        let location2 = loc2.location;

        let distance1 = getDistance(startlocation[0], startlocation[1], location1[0], location1[1]);
        let distance2 = getDistance(startlocation[0], startlocation[1], location2[0], location2[1]);

        return distance1 - distance2;
    });

    for(let i of ads) {
        adCreate(i, i.uid == user.id, user.id);
    }
}

async function adPublish(title_, desc_, reward_) {
    const route = "/tasks/add";
    const geocoords = await getCoords();
    const user = JSON.parse(window.localStorage.getItem("user"));

    if(!user) {
        return null;
    }

    let coords = [geocoords.longitude, geocoords.latitude];

    let response = await sendToRoute({
        title: title_,
        description: desc_,
        uid: user.id,
        location: coords,
        reward: reward_,
        taken_by: ""
    }, route);

    let jsonBody = await response.json();
    adCreate(jsonBody["adObject"], true);
}