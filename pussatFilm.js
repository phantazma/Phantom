const callHttp = require('./utils');
const { encryption, vrfDecrypt, vrfEncrypt, callHttpMethods, checkCaptcha, getSimilarityIndex } = require('./utils');
const cheerio = require('cheerio');


let mainUrl = "https://pf21.vip"

async function init(params){

    //return search(params)
    return ""
}

async function search(params) {
    
    var mediaName = params.name
    var season = params.season
    var episode = params.episode

    var url = mainUrl+"/?s="+mediaName+"&post_type[]=post&post_type[]=tv"
    params.selector = "article.item";

    try {
        const content = await callHttpMethods(url, params);
        const params2 = {
            htmlString: content,
            name: mediaName,
            type: params.type,
            season: season,
            episode: episode
        };

        const pagResult = getMainPage(params2);
       
        console.log(pagResult)
        console.log("here")

        if(params.type == "series"){

            const content = await callHttpMethods(pagResult.posterHref, params);
            const $ = cheerio.load(content);
            $('.custom-epslist').each((index, element) => {
                
                if($(element).find('h3').text() == "Season "+season){

                    $(element).find(".button").each((index2, element2) => {

                        if($(element2).text().replaceAll(' ', '') == episode){
                            pagResult.posterHref = $(element2).attr('href');
                        }

                    });


                        
                }

            });

        }

        console.log(pagResult)

        
    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }

    return '';
}

function getMainPage(params) {
    try {
        const type = params.type
        const mediaName = params.name
        const season = params.season
        const episode = params.episode

        const $ = cheerio.load(params.htmlString);
        const extractedData = [];

        $('.item-infinite').each((index, element) => {

            const titleText = $(element).find('.entry-title').find("a").text();
            const posterHref = $(element).find(".entry-title").find('a').attr('href');
            const hdValue = $(element).find('.gmr-quality-item').find('a').text();
            const similarity = getSimilarityIndex(mediaName, titleText)


            extractedData.push({
                hdValue,
                titleText,
                posterHref,
                type,
                similarity,
            });
        });

        var sim = 0
        var index = 0

        for (const key in extractedData) {
            if (extractedData[key].similarity > sim) {
                sim = extractedData[key].similarity;
                index = key
            }
        }

        return extractedData[index];
        
    }catch (error) {
        console.error('Error during search:', error);
        return "";
    }
}

async function load(params) {
    // Implementation of 'load' method for server 1
    // Example: Load data
    return 'Data loaded from server 1';
}

async function loadLinks(params) {
    // Implementation of 'loadLinks' method for server 1
    // Example: Load links
    return 'Links loaded from server 1';
}
async function checkProvider() {

    let value = JSON.parse('{"pusatFilm": false}');
    return value;
}


// Export methods
module.exports = {
    search,
    getMainPage,
    load,
    loadLinks,
    checkProvider,
    init
};