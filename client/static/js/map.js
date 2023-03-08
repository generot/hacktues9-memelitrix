var map = tt.map({
    container: "map",
    key: "8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote",
})


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

initMap(null);