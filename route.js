async function loadLogin() {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/login/login.html");
}

async function loadHeader() {
    const contentDiv = document.getElementById("header");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/header/header.html");
}

async function loadFeed() {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/feed/feed.html");


    if (window.localStorage.getItem('Feed') !== null) {
        let postArea = document.getElementById('post-area');

        const cachedPost = window.localStorage.getItem('Feed');
        let nodeArray1 = [].slice.call(cachedPost);
        console.log(nodeArray1)
    }

}

/**
 * @param {String} url - address for the HTML to fetch
 * @return {String} the resulting HTML string fragment
 */
async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}


/**
 * Loads main fragments
 * @returns {Promise<void>}
 */
async function loadMainComponents() {
    console.log('Into load main Components')

    await isUserLoggedIn().then(value => {

        if(value){
            console.log('user is loggedIn ' + value)
            loadHeader();
        }
        else {
            console.log('user is NOT loggedIn ' + value)
            loadLogin();
        }
    });
}

/**
 *
 * @returns {Promise<boolean>} returns true if user is logged false otherwise
 */
async function isUserLoggedIn(){
    return window.localStorage.getItem('loggedIn') != null
}