function adCreate(taskJson) {
    let contClass ="adds-small-container";
    let btnClass = "hidden-button";
    let txtClass = "container-text";

    const template = `
    <div class = "${contClass}">
        <!--<title id="ad-title">${taskJson.title}</title>-->
        <button class="${btnClass} task-open-button" onclick="toggleProfileTask(this.parentElement);" id="title" tl="${taskJson.title}">${taskJson.title}(${taskJson.reward} €)</button>
        <button class="${btnClass}" style="float:right;vertical-align:text-top;font-size: 1.2em;top:-100px;text-decoration:none !important;color:#F83939 !important;" onclick="adRemove(this)">X</button>
        <div class="${txtClass}" id="text2" name="deaznam" locationlong="${taskJson.location[0]}" locationlat=${taskJson.location[1]} takenby="">
            <span>${taskJson.description}</span>
        </div>
    </div>
    `

    let tmp = document.createElement("template");
    let container = document.querySelector("#bigCont");

    tmp.innerHTML = template;
    tmp.content.firstElementChild.setAttribute("task-id", taskJson.id);
    
    container.appendChild(tmp.content.firstElementChild);
}

async function adRemove(ad) {
    const route = "/tasks/abandon";
    let user = JSON.parse(window.localStorage.getItem("user"));

    console.log(ad.parentElement);

    let parent = ad.parentElement;
    let title_ = parent.querySelector("#title").getAttribute("tl");

    if(!user) {
        return null;
    }

    parent.remove();

    let resp = await sendToRoute({
        title: title_,
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

    let taskCoords = [];

    for(let i of ads) {
        if(i.taken_by == user.id) {
            adCreate(i, true, user.id);
            taskCoords.push(i.location);
        }
    }

    return taskCoords;
}