function InitMarker(longitude, latitude){
    
    var iconElement = document.createElement('div');
    iconElement.className = 'marker';

    var marker = new tt.Marker({
        element: iconElement
    })
    .setLngLat([longitude, latitude])

    
    return marker;
}

var map = tt.map({
    container: "map",
    key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote",
})

const Markers = []

function generateMarkers(){
    for(let i = 0; i < 10; i++){
        var marker = InitMarker(Math.random()*90, Math.random()*90)
        Markers[i] = marker;
    }
}

function getPosition() {
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

    //map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());

    if(Markers){
        Markers.forEach(marker => marker.addTo(map))
    }
}

generateMarkers();
initMap(Markers);