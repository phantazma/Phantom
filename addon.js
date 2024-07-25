var needle = require('needle')
const express = require('express')
const addon = express()
const { mainFunction,checkProviders } = require('./server');


var providers = []
var allProviders = [ 'cineZone', 'pusatFilm', 'upMovies' ]

addon.use(express.static(__dirname, { // host the whole directory
    extensions: ["html", "htm", "gif", "png"],
}))

addon.get('/cinezone.png', (req, res) => {
    res.sendFile(__dirname + '/img/cinezone.png');
});
addon.get('/pussatfilm.png', (req, res) => {
    res.sendFile(__dirname + '/img/pussatfilm.png');
});
addon.get('/upmovies.png', (req, res) => {
    res.sendFile(__dirname + '/img/upmovies.png');
});
addon.get('/background.jpeg', (req, res) => {
    res.sendFile(__dirname + '/background.jpeg');
});

var MANIFEST = {
    id: 'amenco.phantom',
    version: '1.0.29',
    icon: "https://i.imgur.com/Ullw3Fv.png",
    background: "https://t3.ftcdn.net/jpg/01/24/87/96/360_F_124879604_0ojnEfmCHlbr2eqbk9XNuzgJUJ9Ovk2m.jpg",
    name: 'Phantom',
    description: "Phantom delivers seamless streaming from multiple HTTP sources, offering a rich variety of movies and TV shows. Enjoy reliable and high-quality content directly through Stremio with ease.",
    catalogs: [],
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    behaviorHints: {
        "configurable": true,
        "configurationRequired": false
    }
}

var respond = function (res, data) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
};
addon.get('/', (req, res) => {
    res.sendFile(__dirname + '/configure.html');
});
addon.get('/configure', (req, res) => {
    res.sendFile(__dirname + '/configure.html');
});
addon.get('/:someParameter/configure', function (req, res) {
    res.redirect('/configure?hex=' + req.params.someParameter);
});

addon.get('/manifest.json', function (req, res) {
    respond(res, MANIFEST);
});
addon.get('/:someParameter/manifest.json', function (req, res) {
    respond(res, MANIFEST);
});

addon.get('/providers-availability', (req, res) => {
    var listP = JSON.parse(req.query.providers);

    checkProviders(listP)
        .then(result => {
            console.log('Main function exessfully from otherFile.js : ' + result);
            res.json(result);
        })
        .catch(err => {
            console.error('Error executing main function from otherFile.js:', err);
            res.json(err);
        });
});

addon.param('type', function (req, res, next, val) {
    if (MANIFEST.types.includes(val)) {
        next();
    } else {
        next("Unsupported type " + val);
    }
});

addon.get('/stream/:type/:id.json', function (req, res, next) {
    theCallMethod(req, res)
});

addon.get('/:someParameter/stream/:type/:id.json', function (req, res, next) {
    theCallMethod(req, res)
});


function theCallMethod(req, res){
    if(req.params.someParameter != null){
        let buffer = Buffer.from(req.params.someParameter, 'hex');
        let originalString = buffer.toString('utf-8');
        let providersList = JSON.parse(originalString);
        console.log(originalString)
    
        for (const key in providersList) {
            if (providersList[key] === true && providers.indexOf(key) === -1) {
                providers.push(key);
            }
        }
    }else{
        providers = allProviders
    }


    var urlTable = [];
    var args = req.params;
    var type = args.type;
    var id = args.id;
    var season = -1;
    var episode = -1;

    if (id.indexOf(":") !== -1) {
        var splitted = id.split(":");
        id = splitted[0];
        season = splitted[1];
        episode = splitted[2];
    }

    return new Promise((resolve, reject) => {

        try {
            CheckIMDB(id, type, season, episode, function (urls) {

                //urlTable = urls;
                //var result = JSON.parse(urls);
                //resolve({streams: result});

                var params = {}
                params.id = id
                params.type = type
                params.season = season
                params.episode = episode
                params.name = urls.meta.name

                const seasonString = season != -1 ? " S"+(season <10 ? "0"+season:season ): ""
                const epsiodeString = episode != -1 ? "E"+(episode <10 ? "0"+episode:episode ) : ""

                mainFunction(providers, params)
                    .then(result => {
                        var streams = []
                        for (const key in result) {
                            if (result[key] != "" && typeof result[key] !== 'undefined') {
                                var stream = {}
                                stream.name = result[key].name
                                stream.url = result[key].url.replaceAll("\\","")
                                stream.description = "\u{1F310} "+result[key].title+"\n"+urls.meta.name+seasonString+epsiodeString
                                stream.type = type
                                streams.push(stream);
                            }
                        }

                        console.log("addon : ")
                        console.log(streams)

                        respond(res, { streams: streams });

                    })
                    .catch(err => {
                        console.error('Error executing main function from otherFile.js:', err);
                    });


            })
        } catch (e) {
            console.log(e)
            respond(res, { streams: [] });
        }
    })

}

function CheckIMDB(id, type, season, episode, callback) {
    needle.get('https://v3-cinemeta.strem.io/meta/' + type + '/' + id + '.json', function (err, resp, body) {
        if (body && body.meta) {
            callback(body);
        }
    })

}

addon.listen(7000, function () {
    console.log('Add-on Repository URL: http://127.0.0.1:7000/manifest.json')
})





/*

serveHTTP(builder.getInterface(), { port: 7000 })*/
