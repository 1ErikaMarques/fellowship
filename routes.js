//Const das paginas
const login = './components/login/login.html';
const profile = './components/profile/profile.html';
const header = './components/header/header.html';
const menuNav = './components/menu-nav/menu-nav.html';
const feed = './components/feed/feed.html';
const settings = './components/settings/settings.html';

/**
 * Carrega pagina do Header.
 */
async function loadHeader() {
    const headerDiv = document.getElementById('header');
    headerDiv.innerHTML = await fetchHtmlAsText(header);
    verificaBairro();

    let listaBairros = document.getElementById('header_search_bairros');
    const users = JSON.parse(localStorage.getItem('users'));
    users.forEach(user => {

        if (!listaBairros.children.namedItem(user.neighborhood) && user.id !== usuarioLogado.id) {
            const option = document.createElement('option');
            option.setAttribute('value', user.neighborhood);
            option.setAttribute('name', user.neighborhood);
            listaBairros.appendChild(option);
        }
    })
}

/**
 * Carrega pagina do menu nav.
 */
async function loadMenuNav() {
    const menuNavDiv = document.getElementById('menu_nav');
    menuNavDiv.innerHTML = await fetchHtmlAsText(menuNav);
}

/**
 * Carrega pagina de login.
 */
async function loadLogin() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = await fetchHtmlAsText(login);
}

/**
 * Carrega pagina de perfil.
 */
async function loadProfile(userId) {
    await hideMenuNav(true);
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = await fetchHtmlAsText(profile);

    let profileName = document.getElementById('profile-name');
    let perfilTrabalho = document.getElementById('perfil-trabalho');
    let perfilLocal = document.getElementById('perfil-local');
    let perfilRelacionamneto = document.getElementById('perfil-relacionamento');
    let perfilDataNasc = document.getElementById('perfil-dataNasc');
    let perfilMobile = document.getElementById('perfil-mobile');
    let perfilHobbies = document.getElementById('perfil-hobbies');
    let fotoPerfil = document.getElementById('foto-perfil');
    let fotoPerfilInput = document.getElementById('change-photo-profile');
    let about = document.getElementById('perfil-about');

    document.getElementById("home-icon").children[0].classList.remove("icone-home-ativo");

    // Carrega informacoes do usuario clicado
    if (userId !== undefined && userId.dataset.userid !== usuarioLogado.id) {

        let inputCarregarFoto = document.getElementById('edit-profile');
        inputCarregarFoto.removeAttribute('onclick');
        let botaoEditar = document.getElementById('edit-profile');
        inputCarregarFoto.removeAttribute('title')
        botaoEditar.style.display = 'none'

        const idUsuarioPostagem = userId.dataset.userid
        let usuariosLocalStorage = JSON.parse(localStorage.getItem('users'));

        let usuarioDoPerfil
        for (let i = 0; i < usuariosLocalStorage.length; i++) {
            let usuario = usuariosLocalStorage[i];
            if (idUsuarioPostagem === usuario.id) {
                usuarioDoPerfil = usuario;
                break;
            }
        }

        if (usuarioDoPerfil.photoUrl !== '') {
            fotoPerfil.src = usuarioDoPerfil.photoUrl
        }
        profileName.textContent = usuarioDoPerfil.name;
        perfilTrabalho.textContent = usuarioDoPerfil.work;
        perfilLocal.textContent = usuarioDoPerfil.location;
        perfilRelacionamneto.textContent = usuarioDoPerfil.relationship;
        perfilDataNasc.textContent = usuarioDoPerfil.birthday;
        perfilMobile.textContent = usuarioDoPerfil.mobile;
        perfilHobbies.textContent = usuarioDoPerfil.hobbies;
        about.innerText = usuarioDoPerfil.about;
        fotoPerfilInput.setAttribute('disabled', 'disabled');

    } else {
        // Carrega informacoes do usuario logado
        if (usuarioLogado.photoUrl !== '') {
            fotoPerfil.src = usuarioLogado.photoUrl
        }
        profileName.textContent = usuarioLogado.name;
        perfilTrabalho.textContent = usuarioLogado.work;
        perfilLocal.textContent = usuarioLogado.location;
        perfilRelacionamneto.textContent = usuarioLogado.relationship;
        perfilDataNasc.textContent = usuarioLogado.birthday;
        perfilMobile.textContent = usuarioLogado.mobile;
        perfilHobbies.textContent = usuarioLogado.hobbies;
        about.innerText = usuarioLogado.about;
    }
}

/**
 * Carrega pagina de conf.
 */
async function loadSettings() {
    await hideMenuNav(true);
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = await fetchHtmlAsText(settings);
    document.getElementById('nome-usuario-settings').textContent = usuarioLogado.name;
    document.getElementById('email-input-settings').value = usuarioLogado.email;
    document.getElementById('password-input-settings').value = usuarioLogado.password;
    document.getElementById('name-input-settings').value = usuarioLogado.name;
    document.getElementById('cep-input-settings').value = usuarioLogado.postalCode;
    document.getElementById('bairro-input-settings').value = usuarioLogado.neighborhood;
}

/**
 * Esconde ou exibi menu nav
 * @param hide se true troca para display block , se false troca para none
 */
async function hideMenuNav(hide) {
    const menuNav = document.getElementById('menu_nav')

    if (hide) {
        menuNav.style.display = "none";
    } else {
        menuNav.style.display = "block";
    }
}

/**
 * Carrega conteúdo do feed dinâmico com base no menu selecionado
 */
async function loadFeed(menuSelecionado) {

    await hideMenuNav(false);

    const contentDiv = document.getElementById('content');

    // Se nenhum menu tiver selecionado ignoramos
    if (menuSelecionado !== undefined) {

        const activeClassName = 'active_menu_nav';
        const aparadorMenuNav = 'aparador_menu_nav';

        menuSelecionado.classList.add(activeClassName);

        const menuNavUl = document.getElementById('menu-nav-ul');

        for (let i = 0; i < menuNavUl.children.length; i++) {
            const menuNavLi = menuNavUl.children[i];

            for (let i = 0; i < menuNavLi.children.length; i++) {
                const menuNavLiChild = menuNavLi.children[i];

                if (menuSelecionado !== menuNavLiChild && menuNavLiChild.classList.contains(activeClassName)) {
                    menuNavLiChild.classList.remove(activeClassName)
                }

                for (let i = 0; i < menuNavLiChild.children.length; i++) {
                    const menuNavAChild = menuNavLiChild.children[i];

                    if (menuSelecionado.children[0] !== menuNavAChild && menuNavAChild.classList.contains(aparadorMenuNav)) {
                        menuNavAChild.classList.remove(aparadorMenuNav)
                    } else if (menuSelecionado.children[0] === menuNavAChild) {
                        menuNavAChild.classList.add(aparadorMenuNav)
                    }
                }
            }
        }
    }
    contentDiv.innerHTML = await fetchHtmlAsText(feed);

    let nomeMenu;
    if (menuSelecionado === undefined) {
        nomeMenu = 'noticias';
    } else {
        nomeMenu = menuSelecionado.dataset.name;
    }

    const feedsGuardados = JSON.parse(localStorage.getItem('feeds'));

    // Busca o bairro do usuario
    const bairro = document.getElementById('bairro').textContent;

    if (feedsGuardados !== null) {

        const recuperarSessao = document.getElementById("sessao-de-post");

        for (let i = 0; i < feedsGuardados.bairros.length; i++) {
            const feedBairro = feedsGuardados.bairros[i];
            // Comparamos o bairro do usuario logado com o do localstorage
            if (bairro === feedBairro.bairro) {
                for (let i = 0; i < feedBairro.feeds.length; i++) {
                    const feed = feedBairro.feeds[i];
                    if (nomeMenu === feed.tipoFeed && feed.html !== undefined) {
                        let criandoDiv = document.createElement('div');
                        criandoDiv.classList.add('post', 'container', 'border')
                        criandoDiv.setAttribute('id', feed.postId);
                        criandoDiv.setAttribute('data-tipo', feed.tipoFeed)
                        criandoDiv.insertAdjacentHTML('beforeend', feed.html);
                        recuperarSessao.prepend(criandoDiv)

                        let contemImg = criandoDiv.querySelector('.splide')
                        if (contemImg) {
                            new Splide('.splide').mount();//carrosel img
                        }
                    }
                }
            }
        }
    }
    if (sessionStorage.getItem('espiadinha')) {
        espiadinha()
    }
}

/**
 * @param {String} url - Caminho da pagina que deve ser carregada
 * @returns {Promise<string>} Retorna a pagina como string
 */
async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

/**
 * Carrega os components principais
 * @returns {Promise<void>}
 */
async function loadMainComponents() {

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

function verificaBairro() {
    const usuario = recuperaUsuarioLogado();
    const bairro = document.getElementById('bairro');
    bairro.textContent = usuario.neighborhood;

}

function recuperaUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('loggedUser'));
}

/**
 *
 * @returns {Promise<boolean>} retorna true se o usuario esta logado senao false.
 */
async function isUserLoggedIn() {
    return sessionStorage.getItem('loggedUser') != null
}