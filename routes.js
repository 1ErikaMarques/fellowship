//Const das paginas
const login = './components/login/login.html';
const profile = './components/profile/profile.html';
const header = './components/header/header.html';
const menuNav = './components/menu-nav/menu-nav.html';
const feed = './components/feed/feed.html';
const settings = './components/settings/settings.html';
let usuarioLogado;
let bairros = []

/**
 * Carrega pagina do Header.
 */
async function loadHeader() {
    const headerDiv = document.getElementById('header');
    headerDiv.innerHTML = await fetchHtmlAsText(header);

    const bairro = document.getElementById('bairro');

    bairro.textContent = usuarioLogado.neighborhood;

    let listaBairrosSearch = document.getElementById('header_search_bairros');

    bairros.forEach(bairro => {

        if (!listaBairrosSearch.children.namedItem(bairro) && bairro !== usuarioLogado.neighborhood) {
            const option = document.createElement('option');
            option.setAttribute('value', bairro);
            option.setAttribute('name', bairro);
            listaBairrosSearch.appendChild(option);
        }
    })

    await loadNotifications()
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

        let usuarioDoPerfil

        await usersRef.doc(idUsuarioPostagem).get().then(user => usuarioDoPerfil = user.data())

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
    document.getElementById('email-input-settings').value = firebase.auth().currentUser.email;
    document.getElementById('password-input-settings').value = usuarioLogado.password;
    document.getElementById('name-input-settings').value = usuarioLogado.name;
    document.getElementById('cep-input-settings').value = usuarioLogado.postalCode;
    document.getElementById('bairro-input-settings').value = usuarioLogado.neighborhood;
    document.getElementsByClassName('menu-settings')[0].children[0].src = usuarioLogado.photoUrl

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

    // Busca o bairro do usuario
    const bairro = sessionStorage.getItem('bairroSelecionado') ? JSON.parse(sessionStorage.getItem('bairroSelecionado')) : usuarioLogado.neighborhood

    const recuperarSessao = document.getElementById("sessao-de-post");

    const feeds = await recuperaFeedsPorTopico(bairro, nomeMenu)

    for (let [key, feed] of feeds) {
        let criandoDiv = document.createElement('div');
        criandoDiv.classList.add('post', 'container', 'border')
        criandoDiv.setAttribute('id', key);
        criandoDiv.setAttribute('data-tipo', nomeMenu)
        criandoDiv.insertAdjacentHTML('beforeend', feed.html);
        recuperarSessao.prepend(criandoDiv)

        let contemImg = criandoDiv.querySelector('.splide')
        if (contemImg) {
            new Splide('.splide').mount();//carrosel img
        }
    }

    const photos = document.getElementById('content').querySelectorAll('[name="foto-user"]');
    if (photos.length > 0) {
        photos.forEach(photo => {
            photo.src = usuarioLogado.photoUrl === '' ? 'public/profile/foto-usuario-perfil.svg' : usuarioLogado.photoUrl;
        })
    }

    const apagarPost = document.getElementsByClassName('reticencias');
    for (let apagarPostElement of apagarPost) {
        const postOwner = apagarPostElement.dataset.owner
        if (postOwner !== usuarioLogado.id) {
            apagarPostElement.style.display = 'none'
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

    if (sessionStorage.getItem('loggedUser')) {
        if (usuarioLogado === undefined) {
            usuarioLogado = JSON.parse(sessionStorage.getItem('loggedUser'));
        }
        await recuperaTodosBairros()
        loadHeader();
        loadMenuNav();
        loadFeed();
    } else {
        loadLogin();
    }
}

async function loadUserDetails(userId) {
    await usersRef.doc(userId).get().then(user => {
        usuarioLogado = ({
            id: user.id,
            ...user.data(),
        })
        sessionStorage.setItem('loggedUser', JSON.stringify(usuarioLogado));
    });
}

async function loadNotifications() {
    const liNotifications = document.getElementById('notifications')

    await db.collection(`/usersCollection/${usuarioLogado.id}/notifications`)
        .onSnapshot((doc) => {

            if (doc.docs.length === 0) {
                let p = document.createElement('p')
                p.innerText = 'Você não possui novas notificações'
                let li = document.createElement('li')

                li.setAttribute('name', 'placeholder')
                li.append(p)
                liNotifications.append(li)
            }

            for (let noti of doc.docs) {
                db.collection(`/usersCollection/${usuarioLogado.id}/notifications/`)
                    .doc(noti.id)
                    .onSnapshot((notification) => {
                            //if (notification.exist === true) {
                            let infoNotification = notification.data()
                            if (infoNotification !== undefined && liNotifications.children.namedItem(noti.id) === null) {

                                let p = document.createElement('p')
                                p.innerText = infoNotification.message + ` em ${moment(infoNotification.timestamp.toDate()).format('DD/MM/YYYY H:mm')} `


                                let hr = document.createElement('hr')
                                hr.className = 'header-solid'

                                let div = document.createElement('div')
                                div.className = 'btn-apagar-notification'

                                let img = document.createElement('img')
                                img.src = 'public/feed/icone-lixeira.svg'
                                img.setAttribute('id', noti.id)
                                img.setAttribute('onclick', 'deleteNotification(this)')
                                img.setAttribute('title', 'apagar')

                                let divBackground = document.createElement('div')
                                divBackground.className = 'background-icon'

                                let li = document.createElement('li')
                                li.setAttribute('name', noti.id)

                                div.append(img)
                                li.append(p,div,divBackground, hr)
                                liNotifications.prepend(li)

                                let placeHolderMessage = liNotifications.children.namedItem('placeholder');

                                if (placeHolderMessage !== null) {
                                    liNotifications.removeChild(placeHolderMessage);
                                }

                            }
                        }
                    );
            }
        })
}

/**
 * Busca bairro por topico
 * @param bairro bairro do usuario
 * @param topico topico que deseja buscar
 * @returns {Promise<Map<any, any>>}
 */
async function recuperaFeedsPorTopico(bairro, topico) {

    let feeds = new Map();

    const path = `/feedsCollection/${bairro}/${topico}`

    await db.collection(path).get().then((querySnapshot) => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                feeds.set(doc.id, doc.data())
            });
        }
    });

    return feeds;
}

/**
 * Recupera bairros cadastrados
 * @returns Array de bairros
 */
async function recuperaTodosBairros() {
    await db.collection('/feedsCollection/')
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                bairros.push(doc.id)
            });
        });

    return bairros;
}