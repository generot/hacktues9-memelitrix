function drawRoute(map, geoJSON, index = -1){

    layer = map.addLayer({
        'id' : (index === -1) ? 'route' : 'route_' + index,
        'type' : 'line',
        'source' : {
            'type' : 'geojson',
            'data' : geoJSON
        },
        'paint' : {
            'line-color' : (index === -1) ? 'green' : 'darkred',
            'line-width' : 7
        }
    })
}

function makeRoute(map, from, to, index = -1){        
        //options and coordinates to draw to
        var options = {
            key : '8tSnq5o8nrZgIPZ5S9uTAH9tXReLKote',
            locations : []
        }

        options.locations.push(from.getLngLat())
        options.locations.push(to.getLngLat())

        tt.services.calculateRoute(options)

        .then(
            function(routeData){
                var geo = routeData.toGeoJson();
                drawRoute(map, geo, index)
            }
        )
}

function makeTaskRoute(map, Tasks){
        let bl = null;
        let i = 0;

        for(i = 1; i < Tasks.length; i++) {
            if (bl = map.getLayer("route_" + i)) {
                map.removeLayer("route_" + i);
                map.removeSource("route_" + i);
                Tasks[i - 1].remove();
            }
        }

        if(bl) {
            Tasks[Tasks.length - 1].remove();
            return;
        }

        let from = Tasks[0];
        from.addTo(map);

        for(let index = 1; index < Tasks.length; index++){
            Tasks[index].addTo(map);
            makeRoute(map, from, Tasks[index], index);
            from = Tasks[index];
        }
}