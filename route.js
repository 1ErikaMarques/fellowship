async function loadLogin() {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/login/login.html");
}

async function loadProfile() {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/profile/profile.html");
   const menuNav = document.getElementById('menu_nav')
    menuNav.style.display = "none";
}

async function loadHeader() {
    const contentDiv = document.getElementById("header");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/header/header.html");
}

async function loadMenuNav() {
    const contentDiv = document.getElementById("menu_nav");
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/menu-nav/menu-nav.html");
}

async function loadFeed(ancoraMenuNav) {
    const menuNav = document.getElementById('menu_nav')
    menuNav.style.display = "block";
    const contentDiv = document.getElementById("content");

    if (ancoraMenuNav !== undefined) {
        const activeClassName = 'active_menu_nav';
        const aparadorMenuNav = 'aparador_menu_nav';
        ancoraMenuNav.classList.toggle(activeClassName);

        const menuNavUl = document.getElementById("menu-nav-ul");

        for (let i = 0; i < menuNavUl.children.length; i++) {
            const menuNavLi = menuNavUl.children[i];
                
            for (let i = 0; i < menuNavLi.children.length; i++) {
                const menuNavLiChild = menuNavLi.children[i];

                if (ancoraMenuNav !== menuNavLiChild && menuNavLiChild.classList.contains(activeClassName)) {
                    menuNavLiChild.classList.remove(activeClassName)
                }
                
                for (let i = 0; i < menuNavLiChild.children.length; i++) {
                    const menuNavAChild = menuNavLiChild.children[i];
                    

                    if (ancoraMenuNav.children[0] !== menuNavAChild && menuNavAChild.classList.contains(aparadorMenuNav)) { //filhos do a, que e a div
                        menuNavAChild.classList.remove(aparadorMenuNav)
                    }
                    else if(ancoraMenuNav.children[0] === menuNavAChild) {
                        menuNavAChild.classList.add(aparadorMenuNav)
                    }
                }                
            }
        }
    }
    contentDiv.innerHTML = await fetchHtmlAsText("./src/components/feed/feed.html");
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

        if (value) {
            console.log('user is loggedIn ' + value)
            loadHeader();
            loadMenuNav();
            loadFeed();
        } else {
            console.log('user is NOT loggedIn ' + value)
            loadLogin();
        }
    });
}

/**
 *
 * @returns {Promise<boolean>} returns true if user is logged false otherwise
 */
async function isUserLoggedIn() {
    return sessionStorage.getItem('loggedUser') != null
}