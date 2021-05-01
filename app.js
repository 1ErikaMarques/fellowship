/* Feed */
 
function exibirModal() {
    let modal = document.getElementById("shareEntryModal")
    modal.style.display = "block"
    document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    const entradaDeDados = document.getElementById("entrada-de-dados")
    entradaDeDados.focus()
}

function fecharModal() {
    let modal = document.getElementById("shareEntryModal")
    modal.style.display = "none"
    document.body.style.overflow = "auto" // exibir a barra de scroll quando fechamos a modal
}

function publicarPost(){
    let elementoPost = document.getElementById("entrada-de-dados") //estou colocando a div "entrada-de-dados" do html dentro da const elemento Post
    let conteudoPost =  elementoPost.innerText // acessando o texto da div do modal post    
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
    fotoDoUsuario.src ="https://avatars.githubusercontent.com/u/63205222?v=4"
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
    const fotoDoPost = document.createElement("img") // criando img
    fotoDoPost.className = "publicacao" // estilo da img
    fotoDoPost.src ="assets/images/casas/apartamento-alugar.png"
    fotoDoPost.alt = "apartamento para alugar"

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
    criandoDiv.append(fotoDoPost);
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
            localStorage.setItem('loggedIn', form.username.value)
            location.reload();
        } else {
            alert('Please check your username/password')
        }
    } else {
        alert('Please register first')
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

    localStorage.setItem('loggedIn', 'yes');
}


/* Utils */

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}