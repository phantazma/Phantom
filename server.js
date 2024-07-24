const { init: initCineZone,loadVidPlay : loadVidPlayLinksCineZone,checkProvider : checkProviderCineZone,loadFileMoon } = require('./cineZone');
const { init: initPussatFilm,checkProvider : checkProviderPussatFilm } = require('./pussatFilm');
const { init: initUpMovies,checkProvider : checkProviderUpMovies } = require('./upMovies');

async function handleMultipleServers(serverChoices, params) {
    console.log(serverChoices)
    let promises = serverChoices.map(serverChoice => {

        if (serverChoice == "cineZone") {
            return initCineZone(params)
        } else if (serverChoice == "pusatFilm") {
            return initPussatFilm(params);
        } else if (serverChoice == "upMovies") {
            return initUpMovies(params);
        } else {
            throw new Error(`Server ${serverChoice} not supported.`);
        }
    });

    const results = await Promise.all(promises);
    console.log('All servers responded:', results);
    return results;

}
async function handleMultipleCheck(serverChoices) {
    let promises = serverChoices.map(serverChoice => {

        if (serverChoice == "cineZone") {
            return checkProviderCineZone()
        } else if (serverChoice == "pusatFilm") {
            return checkProviderPussatFilm();
        } else if (serverChoice == "upMovies") {
            return checkProviderUpMovies();
        } else {
            throw new Error(`Server ${serverChoice} not supported.`);
        }
    });

    const results = await Promise.all(promises);
    console.log('All servers responded:', results);
    return results;

}

async function handleMultipleLinks(data) {

    var result = []

    for (const key in data) {
        if(data[key] != -1){
            for(const key2 in data[key]){
                result.push(data[key][key2])
            }
        }
         
    }
    console.log(result)

    let promises2 = result.map(serverChoice => {

        var opts = {}
        opts.selector = ".json-formatter-container";
        opts.url = serverChoice.url
        opts.resolution = serverChoice.resolution

        if (serverChoice.dataId == "41") {             //"41" -> "vidplay"
            return loadVidPlayLinksCineZone(opts)
        } else if (serverChoice.dataId == "45") {      //"45" -> "filemoon"
            return loadFileMoon(opts)
        } else if (serverChoice.dataId == "40") {      //"40" -> "streamtape"
            return ""
        } else if (serverChoice.dataId == "35") {     //"35" -> "mp4upload"
            return ""
        } else if (serverChoice.dataId == "28") {     //"28" -> "mycloud"
            opts.provider = "mycloud"
            return loadVidPlayLinksCineZone(opts)
        } else {
            throw new Error(`Server ${serverChoice.dataId} not supported.`);
        }
    });


    let results = await Promise.all(promises2);
    return results;
}

async function mainFunction(serverChoices, methodParams) {

    return new Promise((resolve, reject) => {
        try {
            handleMultipleServers(serverChoices, methodParams)
                .then(result => {
                    console.log(result)
                    //resolve(result);
                    return handleMultipleLinks(result);

                })
                .then(result2 => {
                    console.log(result2)
                    resolve(result2);
                    // return handleMultipleLinks(result); 

                })
                .catch(err => {
                    console.log("\n" + err)
                    resolve("")
                });

        } catch (error) {
            console.error('Error:', error.message);
        }

    });
}

async function checkProviders(serverChoices) {

    return new Promise((resolve, reject) => {
        try {
            handleMultipleCheck(serverChoices)
                .then(result => {
                    console.log(result)
                    //resolve(result);
                    resolve (result);

                })
                .catch(err => {
                    console.log("\n" + err)
                    reject("here" + -1);
                });

        } catch (error) {
            console.error('Error:', error.message);
        }

    });
}

module.exports = {
    mainFunction,
    checkProviders
};