const { encryption, vrfDecrypt, vrfEncrypt, callHttpMethods, checkCaptcha, getSimilarityIndex } = require('./utils');
const cheerio = require('cheerio');

const keys = ["VmSazcydpguRBnhG", "8z5Ag5wgagfsOuhz"]
const keysVidplay = ["NeBk5CElH19ucfBU", "Z7YMUOoLEjfNqPAt", "eO74cTKZayUWH8x5"]

const JsUnpacker = require('./JsUnpacker');

let mainUrl = "https://cinezone.to"


async function init(params) {

    return search(params)

}

async function search(params) {

    var mediaName = params.name
    var season = params.season
    var episode = params.episode

    var url = mainUrl + "/filter?keyword=$" + mediaName
    params.selector = ".lg-card";

    try {
        const content = await callHttpMethods(url, params);
        console.log("here1")
        console.log(content)
        const params2 = {
            htmlString: content,
            name: mediaName,
            type: params.type,
            season: season,
            episode: episode
        };

        const pagResult = getMainPage(params2);
        console.log("here2")
        console.log(pagResult)

        const params3 = {
            selector: ".server"
        };

        /*console.log(pagResult);
        const contentFromFirstCall = await callHttpMethods(pagResult.posterHref, params3);

        const contentFromSecondCall = await callHttpMethods(pagResult.posterHref, params3);
        const result = load({ htmlString: contentFromSecondCall });*/


        const contentFromFirstCall = await callHttpMethods(pagResult.dataIdUrl, params3);

        var dataIdtmp = contentFromFirstCall.result.split("data-id=\"")[1]
        var dataId = dataIdtmp.split("\"")[0]

        const sndUrl = mainUrl + "/ajax/server/list/" + dataId + "?vrf=" + vrfEncrypt(keys[0], dataId)
        const contentFrom2ndCall = await callHttpMethods(sndUrl, params3);
        const contentFrom2ndCallHtml = contentFrom2ndCall.result + "<span class=\"range\"><a data-id = \"dataId\"\/><\/span>);"
        const result = load({ htmlString: contentFrom2ndCallHtml, resolution: pagResult.hdValue });

        //

        return result;

    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }


}

function getMainPage(params) {

    try {
        const type = params.type
        const mediaName = params.name

        const $ = cheerio.load(params.htmlString);
        const extractedData = [];

        var seasep = ""

        if (params.season != -1) {
            seasep = "/" + params.season + "-" + params.episode
        }

        $('.item').each((index, element) => {
            const dataSrc = $(element).find('.lazyload').attr('data-src');
            const hdValue = $(element).find('b').text();
            const posterHref = mainUrl + $(element).find('a.poster').attr('href') + seasep;
            const titleText = $(element).find('a.title').text();
            const similarity = getSimilarityIndex(mediaName, titleText)
            const dataId = $(element).find('.tooltipBtn').attr('data-tip').split("?/")[0];
            const dataIdUrl = mainUrl + "/ajax/episode/list/" + dataId + "?vrf=" + vrfEncrypt(keys[0], dataId)

            extractedData.push({
                dataSrc,
                hdValue,
                titleText,
                posterHref,
                type,
                similarity,
                dataIdUrl
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
    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }
}

function load(params) {

    try {
        const resolution = params.resolution
        const $ = cheerio.load(params.htmlString);
        const extractedData = [];

        var movieId = $('.range').find('a').attr('data-id');

        $('.server').each((index, element) => {
            const dataId = $(element).attr('data-id');
            const dataLinkId = $(element).attr('data-link-id');
            const encryptedVrf = vrfEncrypt(keys[0], dataLinkId)
            const url = mainUrl + "/ajax/server/" + dataLinkId + "?vrf=" + encryptedVrf

            extractedData.push({
                dataId,
                dataLinkId,
                movieId,
                url,
                resolution
            });

        });

        return extractedData;
    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }
}

async function loadFileMoon(params) {
    try {
        const resolution = params.resolution
        const contentFromfirstCall = await callHttpMethods(params.url, params)
        var params2 = {}

        params2.htmlString = contentFromfirstCall
        var data = params2.htmlString
        var link = vrfDecrypt(keys[1], data.result.url)

        const contentFromSecondCall = await callHttpMethods(link, params)
        constfirstpart = contentFromSecondCall.split("<script data-cfasync='false' type='text/javascript'>")[1]
        const packedJS = constfirstpart.split("</script>")[0]

        //const packedJS = "eval(function(p, a, c, k, e, d) { while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b','g'), k[c]); return p}('1i.8i(\"8h\",8(19){8g(\'1v://8f.8e/8d/8c/8b/8a\').3z(40=>40.1d()).3z(1d=>3y(1d));8 3y(1d){h c=l(\"1q\");c.89({88:[{87:\"1v://86.85.84.83.82/81/80/7z/7y/7x.7w?t=7v-7u&s=3r&e=7t&f=3s&7s=24&7r=7q&7p=7o\"}],m:1d,7n:\"1v://7m.7l/7k.7j\",2n:\"1t%\",2m:\"1t%\",7i:\"7h\",7g:\'7f\',7e:\"7d\",\"7c\":{\"7b\":\"7a\",\"79\":\"78\",\"77\":14},\'76\':{\"74\":\"73\"},72:{71:\"/70/1s/3x-3w.1s?v=3.0.6\",1g:\"3x-3w\"},6z:\"6y\",6x:\"1v://6w.6v\",6u:{},6t:14,6s:[0.25,0.50,0.75,1,1.25,1.5,2]});h 2o,2p,6r;h 6q=0,6p=0;h c=l(\"1q\");h 3v=0,6o=0,6n=0,1c=0;h 2l=\'11\';$.6m({6l:{\'6k-6j\':\'3m-6i\'}});c.d(\'35\',8(x){g(5>0&&x.16>=5&&2p!=1){2p=1;$(\'p.6h\').6g(\'6f\')}g(x.16>=1c+5||x.16<1c){1c=x.16;2h.6e(\'11\',2j.6d(1c),{6c:60*60*24})}});c.d(\'1a\',8(x){3v=x.16});c.d(\'1l\',8(x){3u(x);$(\'.7-12-3h\').2k()});c.d(\'6b\',8(){$(\'p.3t\').6a();2h.2k(\'11\')});8 3u(x){$(\'p.3t\').36();g(2o)1f;2o=1;1u=0;g(69.68===14){1u=1}$.3b(\'/67?b=66&2l=11&65=3s-64-63-3r-62&61=1&5z=&5y=&1u=\'+1u,8(3q){$(\'#5x\').5w(3q)});$(\'.7-9-5v-5u:5t(\"5s\")\').o(8(e){3p();l().5r(0);l().5q(14)});8 3p(){h $1r=$(\"<p />\").1s({16:\"5p\",2n:\"1t%\",2m:\"1t%\",5o:0,3n:0,3o:5n,5m:\"5l(10%, 10%, 10%, 0.4)\",\"2f-5k\":\"5j\"});$(\"<5i />\").1s({2n:\"60%\",2m:\"60%\",3o:5h,\"5g-3n\":\"5f\"}).5e({\'5d\':\'/?b=5c&2l=11\',\'5b\':\'0\',\'5a\':\'3m\'}).3l($1r);$1r.o(8(){$(59).2k();l().1l()});$1r.3l($(\'#1q\'))}l().1a(0);}8 3i(2i){h 3j=2j.3k(2i/60);h 1b=2j.3k(2i%60);g(1b<10){1b=\"0\"+1b}1f 3j+\":\"+1b}8 3a(a){a=3i(a);$(\'#1q\').34(`<p 1p=\"7-12-3h\"><p 1p=\"7-12-2f\">58 57 ${a}</p><1o 1p=\"7-12-r\">56</1o><1o 1p=\"7-12-39\">55</1o></p>`)}8 54(){h m=c.1x(3g);3f.3e(m);g(m.18>1){2s(i=0;i<m.18;i++){g(m[i].1g==3g){3f.3e(\'!!=\'+i);c.2q(i)}}}}c.d(\'53\',8(){l().1h(\'<z 2d=\"2c://2b.2a.29/28/z\" 27:26=\"23\" 22=\" 0 0 1 1\" 21=\"1.1\"/>\',\"52 10 3d\",8(){l().1a(l().3c()+10)},\"1k\");$(\"p[r=1k]\").38().37(\'.7-n-2g\');l().1h(\'<z 2d=\"2c://2b.2a.29/28/z\" 27:26=\"23\" 22=\" 0 0 1 1\" 21=\"1.1\"/>\',\"51 10 3d\",8(){h 1n=l().3c()-10;g(1n<0)1n=0;l().1a(1n)},\"1j\");h 1m=2h.3b(\'11\');g(1m!==4z){3a(1m);$(\'y\').d(\'o\',\'.7-12-r\',8(){c.1l();2v(8(){c.1a(1m)},4y)});$(\'y\').d(\'o\',\'.7-12-39\',8(){l().1l()})}$(\"p[r=1j]\").38().37(\'.7-n-2g\');$(\"p.7-n-2g\").36();$(\'.7-4x-35\').34($(\'.7-2f-4w\'));$(\'y\').d(\'o\',\'.7-33-n-32 .7-n[r=\"1k\"]\',8(){$(\'.7-20 .7-n[r=\"1k\"]\').31(\'o\')});$(\'y\').d(\'o\',\'.7-33-n-32 .7-n[r=\"1j\"]\',8(){$(\'.7-20 .7-n[r=\"1j\"]\').31(\'o\')})});8 2e(){}c.d(\'4v\',8(){2e()});c.d(\'4u\',8(){2e()});l().1h(\"<z 2d=\'2c://2b.2a.29/28/z\' 27:26=\'23\' 22=\' 0 0 1 1\' 21=\'1.1\'/>\",\"4t 4s 4r\",8(){4q 15=1i.4p(\'a\');15.30(\'4o\',\'/4n/11\');15.30(\'4m\',\'4l\');1i.y.4k(15);15.o();1i.y.4j(15)},\"4i\");c.d(\"j\",8(19){h m=c.1x();g(m.18<2)1f;$(\'.7-9-4h-4g\').4f(8(){$(\'#7-9-k-j\').1e(\'7-9-k-17\');$(\'.7-k-j\').w(\'q-u\',\'13\')});c.1h(\"/4e/4d.z\",\"2x 2w\",8(e){$(\'.7-2z\').4c(\'7-9-2y\');g($(\'.7-2z\').4b(\'7-9-2y\')){$(\'.7-9-j\').w(\'q-u\',\'14\');$(\'.7-9-k-j \').w(\'q-u\',\'14\');$(\'.7-9-k-j \').4a(\'7-9-k-17\')}49{$(\'.7-9-j\').w(\'q-u\',\'13\');$(\'.7-9-k-j \').w(\'q-u\',\'13\');$(\'.7-9-k-j \').1e(\'7-9-k-17\')}$(\'.7-20 .7-n:48([q-47=\"2x 2w\"])\').d(\'o\',8(){$(\'.7-9-j\').w(\'q-u\',\'13\');$(\'.7-9-k-j \').w(\'q-u\',\'13\');$(\'.7-9-k-j \').1e(\'7-9-k-17\')})},\"46\");c.d(\"45\",8(19){1z.44(\'1y\',19.m[19.43].1g)});g(1z.2u(\'1y\')){2v(\"2t(1z.2u(\'1y\'));\",42)}});h 1w;8 2t(2r){h m=c.1x();g(m.18>1){2s(i=0;i<m.18;i++){g(m[i].1g==2r){g(i==1w){1f}1w=i;c.2q(i)}}}}$(\'y\').d(\'o\',\'.7-n-9\',8(){$(\'.7-9-k-j \').1e(\'7-9-k-17\');$(\'.7-r-41.7-9-j\').w(\'q-u\',\'13\')})}});', 36, 307, '|||||||jw|function|settings|||videop|on|||if|var||audioTracks|submenu|jwplayer|tracks|icon|click|div|aria|button|||expanded||attr||body|svg||xgeampug0a96|resume|false|true|dl_item|position|active|length|event|seek|remainingSeconds|lastt|json|removeClass|return|name|addButton|document|ff00|ff11|play|savedTime|tt|span|class|vplayer|dd|css|100|adb|https|current_audio|getAudioTracks|default_audio|localStorage|controlbar|version|viewBox|preserve|||space|xml|2000|org|w3|www|http|xmlns|callMeMaybe|text|rewind|ls|seconds|Math|remove|file_code|height|width|vvplay|vvad|setCurrentAudioTrack|audio_name|for|audio_set|getItem|setTimeout|Track|Audio|open|controls|setAttribute|trigger|container|display|append|time|hide|insertAfter|detach|reset|addResume|get|getPosition|sec|log|console|track_name|box|formatTime|minutes|floor|appendTo|no|top|zIndex|showCCform|data|1721681547|19012512|video_ad|doPlay|prevt|theme|jw8|loadPlayer|then|response|color|300|currentTrack|setItem|audioTrackChanged|dualSound|label|not|else|addClass|hasClass|toggleClass|dualy|images|mousedown|buttons|topbar|dd00|removeChild|appendChild|_blank|target|download|href|createElement|const|Video|This|Download|playAttemptFailed|beforePlay|countdown|slider|1500|null||Rewind|Forward|ready|set_audio_track|No|Yes|at|Resume|this|scrolling|frameborder|upload_srt|src|prop|50px|margin|1000001|iframe|center|align|rgba|background|1000000|left|absolute|pause|setCurrentCaptions|Upload|contains|item|content|html|fviews|referer|prem||embed|e53489a7839ce9e98ea8cc9926761621|118|196|hash|view|dl|ZorDon|window|show|complete|ttl|round|set|slow|fadeIn|video_ad_fadein|cache|Cache|Content|headers|ajaxSetup|v2done|tott|vastdone2|vastdone1|vvbefore|playbackRates|playbackRateControls|cast|sx|filemoon|aboutlink|FileMoon|abouttext|assets|url|skin|1080p|2190||qualityLabels|preloadAds|insecure|vpaidmode|vast|client|advertising|start|startparam|metadata|preload|uniform|stretching|jpg|xgeampug0a96_xt|me|videothumbs|image|5500|sp|36925|asn|srv|10800|2Asyws90cP3HTWvEKPyy8|H_kIuXeTwxP1DTyAaXUZu|m3u8|master|wppvctes463p_x|00196|01|hls2|com|cdn112|waw04|rcr72|be6721|file|sources|setup|26086|subtitles|episode|ajax|to|cinezone|fetch|DOMContentLoaded|addEventListener'.split('|')))";
        const unpacker = new JsUnpacker(packedJS);

        if (unpacker.detect()) {
            const unpackedJS = unpacker.unpack();

            var first = unpackedJS.split("[{file:\"")[1]
            var second = first.split("\"}],")[0]

            return { name: '[Phantom] \nFileMoon \n' + resolution, url: second, "title": "CineZone", };


        } else {
            console.log('Not P.A.C.K.E.R. encoded');
            return ""
        }
    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }

}

async function loadVidPlay(params) {

    try {
        const resolution = params.resolution
        const contentFromfirstCall = await callHttpMethods(params.url, params)
        var params2 = {}

        params2.htmlString = contentFromfirstCall
        var data = params2.htmlString
        /*
        var firstpart = data.split("url\":\"")[1];
        var link = firstpart.split("\",\"")[0];*/

        var link = data.result.url
        var streamUrl = vrfDecrypt(keys[1], link);

        const baseUrl = streamUrl.split('?')[0];
        const id = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);

        var const1 = encryption(id, 1, keysVidplay[0])
        var const2 = encryption(id, 2, keysVidplay[1])

        var url = streamUrl.replace("/e/", "/mediainfo/").replace(id, const1) + "&h=" + const2;

        var opts = {}
        opts.selector = ".json-formatter-container";
        console.log(url)
        console.log("here2")

        const contentFromSecondCall = await callHttpMethods(url, opts)

        /*
        var firstpart = contentFromSecondCall.split("result\":\"")[1];
        var link2 = firstpart.split("\",\"")[0];*/

        var link2 = contentFromSecondCall.result

        console.log("here1")
        console.log(link2)

        linkdecrepted = vrfDecrypt(keysVidplay[2], link2);

        var linkdecreptedfst = linkdecrepted.split("file\":\"")[1]
        var link3 = linkdecreptedfst.split("\"}]")[0]

        var value = { name: '[Phantom] \nVidPlay \n' + resolution, url: link3, "title": "CineZone", };
        if (params.provider == "mycloud") {
            value.name = '[Phantom] \nMyCloud \n' + resolution
        }
        return value
    } catch (error) {
        console.error('Error during search:', error);
        return "";
    }

}

async function checkProvider() {

    return new Promise((resolve, reject) => {

        var options = {};
        options.selector = ".lg-card";

        var url = mainUrl + "/filter?keyword=thor"

        callHttpMethods(url, options)
            .then((content) => {
                let value = JSON.parse('{"cineZone": ' + checkCaptcha(content) + '}');
                resolve(value);
            })
            .catch((error) => {
                console.log(error);
                let value = JSON.parse('{"cineZone": false}');
                resolve(value);
            });
    });

}


// Export methods
module.exports = {
    search,
    getMainPage,
    load,
    checkProvider,
    init,
    loadVidPlay,
    loadFileMoon
};
