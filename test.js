const https = require('https');
const cineZone = require('./cineZone');
const { writeToFile,callHttpMethods, checkCaptcha,getSimilarityIndex } = require('./utils');

var constant = 0
// URL of the page to fetch
const url = 'https://cinezone.to/filter?keyword=THOR';

function testIt(url,options) {

    callHttpMethods(url, options)
    .then((data) => {
        
        var params = {};
        params.htmlString = data
        params.mediaName = "Thor"
        params.type = "movie"

        if (constant == 0) {
            constant = 1
            var url2 = cineZone["getMainPage"](params) 
            var opts = options  
            opts.selector = ".server";        
            testIt(url2.posterHref,opts)

        } else if(constant == 1){
            var params2 = {};
            params2.htmlString = data
            var result =  cineZone["load"](params2) 
            constant = 2

            var opts = options  
            opts.selector = ".json-formatter-container"; 

            testIt(result[1].url,opts)
            
        }  else if(constant == 2){
            var params3 = {};
            params3.htmlString = data
            var streamUrl =  cineZone["loadLinks"](params3) 
            constant = 3
            var opts = options  
            opts.selector = "#player-wrapper"; 
            console.log(streamUrl)
            testIt(streamUrl,opts)

        }else{
            console.log(data)
        }
    
    })
    .catch((error) => { console.error(error); return -1; });


}

var options = {}
options.selector = ".lg-card";

testIt(url,options)