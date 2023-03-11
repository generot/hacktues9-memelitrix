const API_KEY = encodeURIComponent(localStorage.getItem("API_KEY"));

var popupOffsets = {
    top: [0, 0],
    bottom: [0, -10],
    "bottom-right": [0, -70],
    "bottom-left": [0, -70],
    left: [25, -35],
    right: [-25, -35],
}

//initializing map
var map = tt.map({
    container: "map",
    key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote"
})

function InitMarker(longitude, latitude, class_name) {
    var iconElement = document.createElement('div');
    iconElement.className = class_name;

    var marker = new tt.Marker({
        element: iconElement,
        anchor: 'center',
    })
        .setLngLat([longitude, latitude])

    return marker;
}

async function getPoints(device_id) {
    let query = queryStringParams("http://127.0.0.1:5000/getBreakIns", [["id", device_id],["API_key", API_KEY]]);
    let resp = await getFromRoute(query);

    const { break_ins } = resp;

    return break_ins;
}

function generatePoints(n) {
    Points = [];
    for (let i = 0; i < n; i++) {
        Points.push({ "lon": Math.random() * 90, "lat": Math.random() * 90 });
    }
    return Points;
}

async function generateMarkers(device_id) {
    let Points = await getPoints(device_id);
    var Markers = [];

    for (let i = 0; i < Points.length; i++) {
        var marker = InitMarker(+Points[i]["lat"], +Points[i]["lon"], i == 0 ? 'user_marker' : 'intrusion_marker');
        Markers[i] = marker;
    }

    return Markers;
}

async function getPosition() {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}

async function initMap(device_id) {
    let Markers = await generateMarkers(device_id);

    map = tt.map({
        container: "map",
        key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote",
        zoom: 15,
        center: new tt.LngLat(Markers[0].getLngLat().lng, Markers[0].getLngLat().lat)
    })

    console.log(Markers[0].getLngLat());

    map.addControl(new tt.NavigationControl());
    for (let i = 0; i < Markers.length; i++) {
        let marker = Markers[i];
        marker.addTo(map);
        if (i != 0) {
            var popup = new tt.Popup({ offset: popupOffsets }).setHTML(
                "obir na " + marker.getLngLat().lng + " , " + marker.getLngLat().lat
            )
            marker.setPopup(popup);
            marker.on('click', function () {
                marker.togglePopup();
            })
        }
    }

}

if(!API_KEY){
    window.location.href = "/login";
}

async function main(){
    const response = await getFromRoute(queryStringParams("http://127.0.0.1:5000/getDevices", [["API_key", API_KEY]]));
    console.log(response);
    var device_container = document.getElementById("device_container");
    response.device_ids.forEach(device_id => {
        device_container.appendChild(create_device_card(device_id, response.device_ids));
    })
    
    initMap(response.device_ids[0]);
}

/* <div style="display:inline-block; background-color:#171f32; width:13vw; margin: 5vh 3.5vw; border-radius:15px; border-style: solid; border-color: white; border-width: 0.25em; max-height:30.5vh;">

<h3 class="text-white" style="text-align:center;"> Device: 123 </h3>

</div> */

function create_device_card(device_id, device_ids){
    const card = document.createElement("div");
    var device_info = document.createElement("h3");
	console.log("device_id = ", device_id);
    card.className = "device_card";
	card.setAttribute('id', `device_${device_id}`);
    device_info.innerText = "device : " + device_id;
    card.appendChild(device_info);
    card.addEventListener("click", function(){
	    for(var card of device_ids) {
		    document.getElementById(`device_${card}`).className="device_card";
		}
		document.getElementById(`device_${device_id}`).className="device_card_selected";
        initMap(device_id);
    })
    return card;
}

main()

const closeDrawer = document.querySelector('.drawer-close-action')
const menuTrigger = document.querySelector('.menu-trigger')
const drawer = document.querySelector('.drawer')
const deviceList = document.querySelector('.device-list')

const createDevice = (id, status) => {
    const device = document.createElement('li')
    const icon = document.createElement('img')
    const info = document.createElement('div')
    const deviceIdInfo = document.createElement('p')
    const deviceStatusInfo = document.createElement('p')
    const deviceId = document.createElement('b')
    const deviceStatus = document.createElement('b')
    device.className = 'device-item'
    icon.className = 'device-item-icon'
    icon.src = '/static/images/device.png'
    icon.alt = 'device icon'
    info.className = 'device-item-info'
    deviceIdInfo.className = 'device-item-name'
    deviceStatusInfo.className = 'device-item-status'
    deviceStatus.className = 'device-item-status-type '
    // tuk moje da e 'success' ili 'error'
    deviceStatus.classList.add('success')
    deviceStatus.innerText = status
    deviceId.className = 'device-item-id'
    deviceId.innerText = id
    deviceIdInfo.innerText = 'Device:'
    deviceIdInfo.appendChild(deviceId)
    deviceStatusInfo.innerText = 'Status:'
    deviceStatusInfo.appendChild(deviceStatus)
    info.appendChild(deviceIdInfo)
    info.appendChild(deviceStatusInfo)
    device.appendChild(icon)
    device.appendChild(info)
    device.addEventListener('click', () => console.log(id, status))
    return device
}

deviceList.appendChild(createDevice('25619', "huj"))
deviceList.appendChild(createDevice('25419', "huj12"))

closeDrawer.addEventListener('click', () => {
    drawer.classList.add('hidden')
})

menuTrigger.addEventListener('click', () => {
    drawer.classList.remove('hidden')
})

