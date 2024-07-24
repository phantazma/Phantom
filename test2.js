const { mainFunction } = require('./server');


var providers = ["cineZone","pusatFilm","upMovies"]

var params = {}
params.name = "thor"
params.id = "tt3456345" 
params.type = "movie"
params.season = "-1"
params.episode = "-1"


mainFunction(providers, params)
.then(result => {
    console.log("mainfunc : "+result);
})
.catch(err => {
    console.error('Error executing main function from otherFile.js:', err);
});
