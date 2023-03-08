<<<<<<< HEAD
//get user location

var options = {     
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    var crd = pos.coords;

    return [crd.latitude, crd.longtitude];
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

//map render
tt.setProductInfo('myMap', '1');


function getCoords() {

    return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(clb => {
            resolve(clb.coords);
        })

    });
}

//initializing map

async function initMap(Markers){

    let coords = await getCoords()
    var long = coords.longitude
    var lat = coords.latitude

    map = tt.map({

            key: '8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote',
            container: 'map',
            zoom : 15,
            center : new tt.LngLat (long, lat),
            maxZoom : 50

        });

        map.addControl(new tt.NavigationControl());
        map.addControl(new tt.GeolocateControl({

        positionOptions: {
            enableHighAccuracy: true
        },

        trackUserLocation: true,
        showAccuracyCircle : false

    }));

    if(Markers)
        for(let index = 0; index < Markers.length; index++){
            placeMarker(map, Markers[index])
        }
        

}


initMap(null);
=======
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
>>>>>>> 8c315c3b0f5b158327bd3c804e9a3fda4578cb2b
