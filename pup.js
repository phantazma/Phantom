const querystring = require('querystring');
const keys = { "chillx": ["KB3c1lgTx6cHL3W"], "aniwave": ["p01EDKu734HJP1Tm", "ctpAbOz5u7S6OMkx"], "cinezone": ["VmSazcydpguRBnhG", "8z5Ag5wgagfsOuhz"], "vidplay": ["NeBk5CElH19ucfBU", "Z7YMUOoLEjfNqPAt", "eO74cTKZayUWH8x5"] }
const { writeToFile,callHttpMethods, checkCaptcha,getSimilarityIndex } = require('./utils');
const JsUnpacker = require('./JsUnpacker');
const { init: initPussatFilm,checkProvider : checkProviderPussatFilm } = require('./pussatFilm');

function vrfEncrypt(key, input) {
    const rc4 = new RC4(key);
    const encrypted = rc4.encrypt(input);

    // Encode the encrypted data in base64 URL-safe format
    const base64Encrypted = Buffer.from(encrypted, 'binary').toString('base64');
    const urlSafeEncrypted = base64Encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // URL encode the result
    const stringVrf = querystring.escape(urlSafeEncrypted);
    return stringVrf;
}

function vrfDecrypt(key, input) {
    // Base64 decode with URL-safe modifications
    const base64Input = input.replace(/-/g, '+').replace(/_/g, '/');
    const vrfBuffer = Buffer.from(base64Input, 'base64');

    // RC4 decryption
    const rc4 = new RC4(key);
    const decrypted = rc4.decrypt(vrfBuffer.toString('binary'));

    // URL decode the result
    const stringVrf = querystring.unescape(decrypted);
    return stringVrf;
}

class RC4 {
    constructor(key) {
        this.key = key;
        this.S = [];
        this.init();
    }

    init() {
        let j = 0;
        for (let i = 0; i < 256; i++) {
            this.S[i] = i;
        }
        for (let i = 0; i < 256; i++) {
            j = (j + this.S[i] + this.key.charCodeAt(i % this.key.length)) % 256;
            [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
        }
    }

    encrypt(input) {
        let i = 0, j = 0;
        const result = [];
        for (let k = 0; k < input.length; k++) {
            i = (i + 1) % 256;
            j = (j + this.S[i]) % 256;
            [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
            const K = this.S[(this.S[i] + this.S[j]) % 256];
            result.push(String.fromCharCode(input.charCodeAt(k) ^ K));
        }
        return result.join('');
    }
    decrypt(input) {
        let i = 0, j = 0;
        const result = [];
        for (let k = 0; k < input.length; k++) {
            i = (i + 1) % 256;
            j = (j + this.S[i]) % 256;
            [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
            const K = this.S[(this.S[i] + this.S[j]) % 256];
            result.push(String.fromCharCode(input.charCodeAt(k) ^ K));
        }
        return result.join('');
    }
    encryptDecrypt(input) {
        let i = 0;
        let j = 0;
        let result = '';
        for (let k = 0; k < input.length; k++) {
            i = (i + 1) % 256;
            j = (j + this.S[i]) % 256;
            [this.S[i], this.S[j]] = [this.S[j], this.S[i]]; // Swap
            const t = (this.S[i] + this.S[j]) % 256;
            result += String.fromCharCode(input.charCodeAt(k) ^ this.S[t]);
        }
        return result;
    }
    
}

// Base64 encoding with replacing '/' with '_'
function base64Encode(input) {
    return Buffer.from(input).toString('base64').replace(/\//g, '_');
}

function encodeId(id) {
    console.log(keys.vidplay[0])
    console.log(keys.vidplay[1])
    const rc4Cipher1 = new RC4(keys.vidplay[0]);
    const rc4Cipher2 = new RC4(keys.vidplay[1]);

    // First RC4 decryption
    let decrypted = rc4Cipher2.encrypt(id);

    // Second RC4 decryption
    decrypted = rc4Cipher1.encrypt(decrypted);

    // Base64 encode and replace '/' with '_'
    const encoded = base64Encode(decrypted);

    return encoded;
}

function Encryption(input,code){

    const rc4 = new RC4(keys.vidplay[0]);
    const rc42 = new RC4(keys.vidplay[1]);
    const rc43 = new RC4(keys.vidplay[2]);

    var encrypted2 =""

    if(code == 1){
         encrypted2 = rc4.encrypt(input);
    }
    else if (code == 2){
         encrypted2 = rc42.encrypt(input);
    }else{
        encrypted2 = rc43.encrypt(input);
   }
   
    // Encode the encrypted data in base64 URL-safe format
    const base64Encrypted = Buffer.from(encrypted2, 'binary').toString('base64');
    const urlSafeEncrypted = base64Encrypted.replace("/", "_");

    // URL encode the result
    //const stringVrf = querystring.escape(urlSafeEncrypted);
    return urlSafeEncrypted;
}

/*
////// Example usage
const key = keys.cinezone[0];
const input = '156500';
const encryptedVrf = vrfEncrypt(key, input);
console.log(encryptedVrf);
*/
//const key2 = keys.cinezone[1];
//const input2 ="VfxvGYo3N8o-U0vTPLDqDq6eGaaV86UxVDK5NAMpyiYR_S4COpqQV7SBIG5h-0OGmj8ThbGfAHupCneJJ74Ijcp6-snPVMgVZOer4UsJGe6A9FGFNwFz3cKTyAePD0pyEZNYI1qFK-nD3GkduFaTllc80qwfoBqkKZx40Oy9JtG-_Q5Qu7q-LGlrtqhW9gS2PBBYO--L6hwHBMZxrZ0lEHT15gU7-Q=="

//const input3 = "Y_uHUcYdzfpZhOLdgSEykoSfgj48Xv2j2YnL9PNMcUnZ7_TgvEZVFP2tooxze2BuEpC_EOJGvQbqfyVJ8FVGvOY-CYidP43xsEQnc-zg-I6pe1pVbDHzaOPiBqjdi7Gmuon-augDxqzk-MEYJfjuWiYQdq89OE2UyWNVWb218ldszK83T_dt3q7qFDu4C8CZV6dbksVtV_WsYD6dXrBxJxmSa8VQoic1uM-gEfK85MZh9A0Y7vrG6MbacbngekCP37EwtjUnX97B07APYm-v00Y33bY2mVIMLwdZYjsraHMfa-ixrDVvEKx56rh_v-BWsDCXkn8LBTX4fkXlJ4iIEdUlSqfjibPQQFx72rAM0p-GLcjOLVcT4Yeu-Yl-F0FtX9L8R6popA2eP_2NOVuVSelf2kVDmqN4WTjhophpxdxQk3YIp7LSjVFdsXR4ds555c_1NrBGqgyyBEwzH4dghoILfyoAt-096cA_hko9azDRZAFZ1e1ctw=="
//const dycreptedVrf = vrfDecrypt(keys.vidplay[2], input3);
//console.log(dycreptedVrf);
/*
var url = "https://megaf.cc/e/k139mr?t=4xjSCPAmBFIJxA%3D%3D&ads=0&sub.info=https%3A%2F%2Fcinezone.to%2Fajax%2Fepisode%2Fsubtitles%2F26086"
const baseUrl = url.split('?')[0];
// Extract the last part of the URL path
const id = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
console.log(encodeId(id))*/


//console.log(test("k139mr"))
/*
var k = "VXlXragd6p7MrZogWLsaTTfEJv0fmglEbQ=="
const a = [k];
var id = "rOnTPw0+"

for (let i = 0; i < id.length; i++) {
    const value = (k.charCodeAt(i % k.length) + id.charCodeAt(i)).toString();
    a.push(value);
}

const params = a.join(",");
const query = url.split("?")[1]; // Equivalent to Kotlin's substringAfter("?")
;const mainUrl = "https://megaf.cc"

console.log(`${mainUrl}/mediainfo/${params}?${query}`)
//https://megaf.cc/mediainfo/VXlXragd6p7MrZogWLsaTTfEJv0fmglEbQ==,200,167,218,172,194,216,151,143?t=4xjSCPAmDVcIyA%3D%3D&ads=0&sub.info=https%3A%2F%2Fcinezone.to%2Fajax%2Fepisode%2Fsubtitles%2F26086

var test3 = "VfxvGYo3N8o-U0vTPLDxAq3NGemQvvNqZjK5NAMn3iduqG93PpPRJL73RFpOjTOQq2xil9ypE3nPaAPPIqp76IF_-snMBuhDc-HclUsJGfyR5VrfHVc5ysek1RHVFlcxTINYJhfDaqv23GkduVHVzQxr7uZD8AaWJdAkgKSUKd7x8URHvL3KD3hopL8XoRS2T0duIemG-hBWWpYwztxlQEaupFlmvKHB2_xufMKRfdk="
console.log(vrfDecrypt(keys.cinezone[1], test3))

var value = "83P7O5V92PLE"

console.log(test(value)) */

/*https://vid2faf.site/mediainfo/BLhESJvcBx-xvKTg?t=4xjSCPAuA1APxA%3D%3D&ads=0&sub.info=https%3A%2F%2Fcinezone.to%2Fajax%2Fepisode%2Fsubtitles%2F26086&h=w2CkTvuQF5GPqQPC
dataId: '41',
    dataLinkId: '156502',
    movieId: '26086',
    url: 'https://cinezone.to/ajax/server/156502?vrf=YP3Q3bDq'*/

    //var tt = "Y_uHUcYdzfpZhOLdgSEykoSfgj48Xv2j2YnL9PNMcUnZ7_TgvEZVFP2tooxze2BuEpC_EOJGvQbqfyVJ8FVGvOY-CZvJb9K9skI2aNysvq3TPStdNQDLe_T6LvqIqK2hzpz5SLdQxf23_cEYdKi6CXpCJ_85OReQyjkEDbzk9lI8k_k3RaRs1ai6FGzpWpXJDaEJwp1sW_T4PmjPWLcne0-TOZBQ8CNkv8ijHffvs8Nl9VAa6_zIv8KIJrq6ekXfiOcw5mshXYiU2uRdaj-h0kVg17w2yV1YLVdUNDAraiRPaOjn-jQ5Q_5_6L0ptO8K72CQz38NAjGpLhXpeomIR9J6QfG0i7aGEA992-BdisuMKcjOLFNC4ov7-d55Ehc0DdL5EP86owDdbovNaS3OWOoum0Rnz687FXvr15lo19km0yF6-6-F-hFbki0kNt40uMq1OK0Srk_gJAg1aJZnp5UKdDtDtb9k-dUj2Vx7EjDWFAFb1e1et1nVvM-yj9P0z0TFcgA91Nae-dOo-2gcOUZ19w=="
    //console.log(vrfDecrypt(keys.vidplay[2], tt))

//var tttt = "VfxvGYo3N8o-U0vTPLC_WrzJB-TP9K57ay25NAMn3idu42UUfe2LR-O3bW9njTKQ-noXp83iPR70UhH5M9ZP-ch7j4K4EJ5TcpDK41sIa7jHoB6IKkIvvMHykkWIClt5SsgNDVqEWrPxjStbryLFzHh8mvZDgxHic4sMhreVIsGw605M-ufdeywwg6ZY8lmhOxcsDv-Z9wYcDMYnupoiZEGyskFqu-iWnesae8bndNgWq_mZ"
//console.log(vrfDecrypt(keys.cinezone[1], tttt))


    /*const url= "https://81u6xl9d.xyz/e/xgeampug0a96/?t=4xjSCPMhDVMOzw%3D%3D&ads=0&sub.info=https%3A%2F%2Fcinezone.to%2Fajax%2Fepisode%2Fsubtitles%2F26086"
    callHttpMethods(url, "") .then(contentFromfirstCall => {
     
        constfirstpart = contentFromfirstCall.split("<script data-cfasync='false' type='text/javascript'>")[1]
        const packedJS = constfirstpart.split("</script>")[0]
    
       const unpacker = new JsUnpacker(packedJS);
        
        if (unpacker.detect()) {
          const unpackedJS = unpacker.unpack();
          console.log('\n\n-------------\n\n');

          var first = unpackedJS.split("[{file:\"")[1]
          var second = first.split("\"}],")[0]
          console.log(second);

        } else {
          console.log('Not P.A.C.K.E.R. encoded');
        }

    })*/


        console.log(initPussatFilm({name:"friends",type:"series",season : "1",episode:"13"}));