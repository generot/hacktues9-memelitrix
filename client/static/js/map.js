var popupOffsets = {
    top: [0, 0],
    bottom: [0, -10],
    "bottom-right": [0, -70],
    "bottom-left": [0, -70],
    left: [25, -35],
    right: [-25, -35],
}
  

function InitMarker(longitude, latitude, class_name){
    
    var iconElement = document.createElement('div');
    iconElement.className = class_name;

    var marker = new tt.Marker({
         element: iconElement,
         anchor : 'center',
    })
    .setLngLat([longitude, latitude])

    
    return marker;
}

//initializing map
var map = tt.map({
    container: "map",
    key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote",
})


function generateMarkers(){
    var Markers = []
    for(let i = 0; i < 10; i++){
        var marker = InitMarker(Math.random()*90, Math.random()*90, 'intrusion_marker');
        Markers[i] = marker;
    }

    return Markers;
}

async function getPosition() {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}

async function initMap(Markers){

    var position = await getPosition();

    map = tt.map({
        container: "map",
        key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote",
        zoom : 15,
        center : new tt.LngLat(position.coords.longitude, position.coords.latitude)
    })

    map.addControl(new tt.NavigationControl());
    
    let marker = await InitMarker(position.coords.longitude, position.coords.latitude, 'user_marker');
    marker.addTo(map);

    if(Markers){
        Markers.forEach(marker => {
            marker.addTo(map);
            var popup = new tt.Popup({ offset: popupOffsets }).setHTML(
                "obir na " + marker.getLngLat().lng + " , " + marker.getLngLat().lat
            )
            marker.setPopup(popup);
            marker.on('click', function(){
                marker.togglePopup();
            })
        })
    }

}

initMap(generateMarkers())
