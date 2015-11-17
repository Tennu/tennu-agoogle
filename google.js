var rp = require("request-promise");

function google(query, rsz) {
    var options = {
        uri: 'https://ajax.googleapis.com/ajax/services/search/web',
        qs: {
            q: query,
            v: "1.0",
            rsz: rsz
        },
        headers: {
            'Content-Type': 'application/json'
        },
        json: true // Automatically parses the JSON string in the response 
    };

    return rp(options)
        .then(function(response) {
            return response;
        })
}

module.exports = google;