var fetch = require('node-fetch');
var querystring = require('querystring');

function google(query, rsz) {

    const URI = 'https://ajax.googleapis.com/ajax/services/search/web?' + querystring.stringify({
        q: query,
        v: "1.0",
        rsz: rsz
    });

    var options = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return fetch(URI, options)
        .then(function(response) {
            return response.json();
        })
}

module.exports = google;