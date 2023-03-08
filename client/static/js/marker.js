const Marker = function(latitude, longitude){
        this.lon = longitude
        this.lat = latitude
}

//drawing a marker on the map
function placeMarker(map, marker){
    var mapMarker = new tt.Marker({
        draggable : false
    })
    .setLngLat([marker.lon, marker.lat])
    .addTo(map);

    var lnglat = new tt.LngLat(marker.lon, marker.lat);
    map.setCenter(lnglat);

    return mapMarker
}
