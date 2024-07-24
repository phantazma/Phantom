// Example methods
const callHttp = require('./utils');

async function init(params){

    return -1;
}

async function search(params) {
    // Implementation of 'search' method for server 1
    // Example: Perform search logic
    return 'Search results from server 2';
}

async function getMainPage(params) {
    // Implementation of 'getMainPage' method for server 1
    // Example: Fetch main page content
    return 'Main page content from server 1';
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

    let value = JSON.parse('{"upMovies": false}');
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