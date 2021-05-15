/* Feed */
/**
 *
 */
function exibirModal() {
    let modal = document.getElementById("shareEntryModal")
    modal.style.display = "block"
    document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    const entradaDeDados = document.getElementById("entrada-de-dados")
    entradaDeDados.focus()
}

/**
 *
 */
function fecharModal() {
    let modal = document.getElementById("shareEntryModal")
    modal.style.display = "none"
    document.body.style.overflow = "auto" // exibir a barra de scroll quando fechamos a modal
}

/**
 *
 */
function publicarPost() {
    const elementoPost = document.getElementById("entrada-de-dados") //estou colocando a div "entrada-de-dados" do html dentro da const elemento Post
    const conteudoPost = elementoPost.innerText // acessando o texto da div do modal post
    let imgPostModal = document.getElementById("img-modal-post")
    const recuperarSessao = document.getElementById("sessao-de-post") // estou colocando a sessao de post do html dentro da const recuperarSessao

    // criando a div principal(container)
    const criandoDiv = document.createElement("div") // div principar, div container
    criandoDiv.className = "post container" // div que criamos no js herdar o estilo css que criamos na div do html

    // criando a div que amarra nome do usuario e foto
    const divInformacaoDoUsuario = document.createElement("div")// criando div que amarra foto de perfil e nome do post
    divInformacaoDoUsuario.className = "usuario_post" //estilo da div

    // criando a foto do usuario no post
    const fotoDoUsuario = document.createElement("img") // criando img
    fotoDoUsuario.className = "img_post" // estilo da img
    fotoDoUsuario.src = "https://avatars.githubusercontent.com/u/63205222?v=4"
    fotoDoUsuario.alt = "Erika Marques"

    // criando nome do usuario
    const nomeUsuario = document.createElement("h3")
    nomeUsuario.innerText = "Erika Marques"

    // criando paragrafo do post
    const paragrafo = document.createElement("p")
    paragrafo.className = "texto_publicacao" // associando o estilo css para a tag crianda
    paragrafo.innerText = conteudoPost // colocando o conteudo que conseguimos acessar da modal
    elementoPost.textContent = null // limpando o texto da modal apos a publicaçao,para as futuras publicaçoes a modal estar sem nenhum texto

    //criando a img do post 
    let fotosDoPost = [];
    for (let i = 0; i < imgPostModal.children.length; i++) {
        let imgPost = imgPostModal.children[i]
        let fotoDoPost = document.createElement("img") // criando img
        fotoDoPost.className = "publicacao" // estilo da img
        fotoDoPost.src = imgPost.src
        fotosDoPost.push(fotoDoPost)
    }

    // Removendo elementos img da modal
    imgPostModal.textContent = null;

    // criando area de comentarios 
    //div
    const divComentarios = document.createElement("div");
    divComentarios.className = "area_comentarios"; // estilo

    //img
    const UsuarioComentarioImg = document.createElement("img");
    UsuarioComentarioImg.className = "img_comentario";
    UsuarioComentarioImg.src = "assets/images/usuarios/jovem-estudante.png";

    //input
    const comentarioUsuario = document.createElement("input");
    comentarioUsuario.type = "text";
    comentarioUsuario.placeholder = "Escreva um comentário";

    //associando pais e filhos    
    divInformacaoDoUsuario.appendChild(fotoDoUsuario);
    divInformacaoDoUsuario.appendChild(nomeUsuario);
    divComentarios.appendChild(UsuarioComentarioImg);
    divComentarios.appendChild(comentarioUsuario);
    criandoDiv.prepend(divInformacaoDoUsuario); // prepend para ele ser sempre o que veem em primeiro no post
    criandoDiv.append(paragrafo);
    fotosDoPost.forEach(imgTags => criandoDiv.append(imgTags));
    criandoDiv.append(divComentarios);

    recuperarSessao.prepend(criandoDiv) // jogando a div que criamos dentro da sessao, para isso associamos a div como filho da sessao
    fecharModal()
}
/**
 * Valida detalhes de usuario inserido
 * @param form o formulario de login
 */
function checkLogin(form) {

    if (form.username.value === '' || form.password.value === '') {
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'))

    if (users !== null) {
        let username;
        let password;

        for (let user of users) {
            if (user.email === form.username.value) {
                username = user.email
                password = user.password
                break;
            }
        }

        if (form.username.value === username && form.password.value === password) {
            userSession(form.username.value, usuarioCadastrado);
            location.reload();
        } else {
            alert('Please check your username/password')
        }
    } else {
        alert('Por favor se cadastre')
    }
}
/*Login / Cadastro*/
/**
 * Usuario objeto
 * @param id id do usuario
 * @param username o nome de usuario
 * @param email o email do usuario
 * @param password a senha do usuario
 * @returns {{password, email, username}}
 */
function addUser(id, username, email, password) {
    return {
        "id": id,
        "username": username,
        "email": email,
        "password": password
    };
}


/**
 * Cadastra usuario e ativa sessao.
 * @param form formulario de cadastro
 */
function register(form) {

    if (form.username.value === '' || form.password.value === '') {
        return;
    }

    const newUser = addUser(uuid(), form.username.value, form.email.value, form.password.value);

    if (localStorage.getItem('users')) {
        let storedUsers = JSON.parse(localStorage.getItem('users'));
        storedUsers.push(newUser)
        localStorage.setItem('users', JSON.stringify(storedUsers));
    } else {
        let users = [];
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users));
    }

    userSession(newUser, novoUsuario);
}

/**
 *
 * @param userParam
 * @param tipoUsuario
 */
function userSession(userParam, tipoUsuario) {

    if (tipoUsuario === novoUsuario) {
        sessionStorage.setItem("loggedUser", JSON.stringify(userParam))
    }
    else {
        const users = JSON.parse(localStorage.getItem('users'))
        for (let user of users) {
            if (user.email === userParam) {
                sessionStorage.setItem("loggedUser", JSON.stringify(user))
            }
        }
    }
}

/**
 *
 * @param inputElement elemento input
 */
function addImgToPost(inputElement) {

    // Buscando sessao das imagens
    const imgPostSection = document.getElementById("img-modal-post")
    const files = Array.from(inputElement.files);

    files.forEach(file => {

        // Criando URL
        const imgUrl = URL.createObjectURL(file)
        // Criando elemento img e atribuindo link da imagem
        const imgPost = document.createElement("img")
        imgPost.src = imgUrl;

        // Adicionando novo elemento a sessao
        imgPostSection.appendChild(imgPost)
    })


    //Limpando input
    inputElement.value = null;
}

/* Utils */

const novoUsuario = 1;
const usuarioCadastrado = 2;

function buscarBairros(elem) {
    let selector = document.getElementById("header_search");
   /* // Check if input is empty
    if (elem.value.trim() !== "") {
        elem.classList.add("dropdown"); // Add dropdown class (for the CSS border-radius)
        // If the selector div element does not exist, create it
        if (selector == null) {
            selector = document.createElement("div");
            selector.id = "selector";
            elem.parentNode.appendChild(selector);
            // Position it below the input element
            selector.style.left = elem.getBoundingClientRect().left + "px";
            selector.style.top = elem.getBoundingClientRect().bottom + "px";
            selector.style.width = elem.getBoundingClientRect().width + "px";
        }
        // Clear everything before new search
        selector.innerHTML = "";
        // Variable if result is empty
        let empty = true;
        for (let item in db) {
            // Join the db elements in one string
            let str = [item.toLowerCase(), db[item][0].toLowerCase(), db[item][1].toLowerCase()].join();
            // If exists, create an item (button)
            if (str.indexOf(elem.value) !== -1) {
                let opt = document.createElement("button");
                opt.setAttribute("onclick","insertValue(this);")
                opt.innerHTML = db[item][0];
                selector.appendChild(opt);
                empty = false;
            }
        }
        // If result is empty, display a disabled button with text
        if (empty === true) {
            let opt = document.createElement("button");
            opt.disabled = true;
            opt.innerHTML = "No results";
            selector.appendChild(opt);
        }
    }
    // Remove selector element if input is empty
    else {
        if (selector !== null) {
            selector.parentNode.removeChild(selector);
            elem.classList.remove("dropdown");
        }
    }*/
}

function insertValue(elem) {
    window.search.classList.remove("dropdown");
    window.search.value = elem.innerHTML;
    elem.parentNode.parentNode.removeChild(elem.parentNode);
}

const db = {
    "03067":["Bake Rolls 100g","snack"],
    "04089":["Potato Chips 70g","snack"],
    "05612":["Ice Coffee 100ml","drink"],
    "07740":["Sparkling Water 1.5l","drink"]
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/*Modal Cadastro*/

function modalCadastro() {
    const modal = document.getElementById("modalCadastro")
    modal.style.display='block';

}

function fecharModalCadastro(){
    const modal = document.getElementById("modalCadastro")
    modal.style.display='none';
}
