const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const querystring = require('querystring');
const axios = require('axios');

async function callHttpMethods(url, options) {
    console.log("heeeere 2")
    try {
        console.log("heeeere 3")
        console.log(url)
        const response = await axios.get(url);
        console.log("response: " + response);
        return response.data
    } catch (error) {
        console.error('Error fetching the webpage:', error);
        console.log('Error fetching the webpage:', error);
        return "";
        
    }
}



/*async function callHttpMethods(url, options) {

    var selector = options.selector

    try {
        const browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            args: [
                "--proxy-server='direct://'",
                '--proxy-bypass-list=*',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--single-process',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--enable-features=NetworkService'
            ]
        });

        const page = await browser.newPage();


        console.log("selec : " + selector)
        const responses = [];

        if (selector == "#player-wrapper") {
            page.on('response', async response => {
                const responseData = {
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    body: null
                };

                // Check if the response is not a redirect
                if (response.status() < 300 || response.status() >= 400) {
                    try {
                        responseData.body = await response.text();
                    } catch (e) {
                        console.error(`Error fetching body for ${response.url()}:`, e.message);
                    }
                }

                responses.push(responseData);

            });

        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector(selector, { timeout: 60000 });
        const content = await page.content();
        return content;

    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        return -1
    }

}*/

function checkCaptcha(page) {
    if (page.indexOf("g-recaptcha") !== -1 || page.indexOf('iframe[src*="recaptcha"]') !== -1) {
        return true;
    } else {
        return false;
    }
}

function getSimilarityIndex(s1, s2) {
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return (maxLength - distance) / maxLength;
}

function levenshteinDistance(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i += 1) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= len2; j += 1) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= len1; i += 1) {
        for (let j = 1; j <= len2; j += 1) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,   // deletion
                dp[i][j - 1] + 1,   // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return dp[len1][len2];
}

function writeToFile(file, text) {

    fs.appendFile(file, text, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

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

function encryption(input,code,key){

    const rc4 = new RC4(key);
    const rc42 = new RC4(key);

    var encrypted2 =""

    if(code == 1){
         encrypted2 = rc4.encrypt(input);
    }
    else{
         encrypted2 = rc42.encrypt(input);
    }
   
    // Encode the encrypted data in base64 URL-safe format
    const base64Encrypted = Buffer.from(encrypted2, 'binary').toString('base64');
    const urlSafeEncrypted = base64Encrypted.replace("/", "_").replace(/\+/g, '-');

    // URL encode the result
    //const stringVrf = querystring.escape(urlSafeEncrypted);
    return urlSafeEncrypted;
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
 
}


module.exports = {
    callHttpMethods,
    checkCaptcha,
    getSimilarityIndex,
    writeToFile,
    vrfEncrypt,
    vrfDecrypt,
    encryption
}
