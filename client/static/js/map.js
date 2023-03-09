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
    let query = queryStringParams("http://127.0.0.1:5000/getBreakIns", [["id", device_id]]);
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

initMap(2);