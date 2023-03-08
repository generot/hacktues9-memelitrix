/**
 * @param {Object} jsonData 
 * @param {String} route 
 */
function sendToRoute(jsonData, route) {
    const resp = fetch(route, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    });

    return resp;
}

/**
 * @param {String} route 
 * @returns 
 */
async function getFromRoute(route) {
    const resp = await fetch(route, {
        mode: "no-cors"
    });

    return resp.json();
} 

function queryStringParams(url, args) {
    let query = url + "?";
    for(let i = 0; i < args.length; i++) {
        let param = args[i];
        query += param[0] + "=" + param[1];

        if(i < args.length - 1)
            query += "&";
    }

    return query;
}