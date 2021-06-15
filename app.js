//Login / Cadastro
/**
 * Valida login
 * @param form formulario de login
 */
async function verificaLogin(form) {

    const email = form.email.value;
    const password = form.password.value;

    let userId;

    await auth.signInWithEmailAndPassword(email, password)
        .then((authentication) => {
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            userId = authentication.user.uid
        })
        .catch(function (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('errorCode', errorCode, 'error message ', errorMessage)
            if (errorCode === 'auth/user-not-found') {
                alert('Este email não está cadastrado')
            } else if (errorCode === 'auth/wrong-password') {
                alert('Senha incorreta')
            }
            else if(errorCode === 'auth/too-many-requests'){
                alert('O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login falhadas. ' +
                    'Você pode restaurá-lo imediatamente redefinindo sua senha ou pode tentar novamente mais tarde.')
            }
        })
    if (userId !== undefined) {
        await loadUserDetails(userId);
        reloadPage();
    }
}

function logout() {
    auth.signOut().then(() => {
        console.log('Usuario deslogado')
        sessionStorage.clear()
    }).catch((error) => {
        console.log('Ocorreu um erro', error)
    });

    reloadPage()
}

/**
 * Cadastra usuario e ativa sessao.
 * @param form formulario de cadastro
 */
async function registro(form) {

    const postalCode = form.postalCode.value;
    const neighborhood = form.neighborhood.value;
    const birthday = moment(form.birthday.value).format('DD/MM/YYYY', true);
    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value;

    if (neighborhood === '') {
        alert('Por favor insira um cep válido')
        return;
    }

    await auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user;
        }).then((registeredUser) => {
            return usersRef.doc(registeredUser.uid).set(({
                name: name,
                birthday: birthday,
                postalCode: postalCode,
                neighborhood: neighborhood,
                hobbies: '',
                mobile: '',
                relationship: '',
                work: '',
                location: '',
                photoUrl: '',
                about: '',
            }))
        }).then(() => {
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            reloadPage();
        }).then(() => {
            firebase.auth().currentUser.sendEmailVerification().then(function () {
                console.log('confirmacao de email enviado')
            }).catch(function (error) {
                console.log('Algo de ruim aconteceu', error.message)
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('errorCode', errorCode, 'error message ', errorMessage)
            alert(errorMessage)
        })
}

/**
 * Busca cep e preenche campo de bairro no formulario de cadastro.
 * @param valorPreenchido o cep preenchido no formulario de cadastro.
 * @param inputBairroId id do input do bairro
 */
async function preencheBairro(valorPreenchido, inputBairroId) {

    //Nova variável "cep" somente com dígitos.
    let cep = valorPreenchido.replace(/\D/g, '');

    //Expressão regular para validar o CEP.
    let validacep = /^[0-9]{8}$/;

    //Valida o formato do CEP.
    if (validacep.test(cep)) {
        document.getElementById(inputBairroId).value = "...";

        await fetch(`https://viacep.com.br/ws/${cep}/json`)
            .then(response => response.json())
            .then(res => {
                if (!("erro" in res)) {
                    document.getElementById(inputBairroId).value = `${res.bairro} - ${res.uf}`;
                } else {
                    alert("CEP não encontrado.");
                    document.getElementById(inputBairroId).value = null;
                }

            })
            .catch(onerror => {
                alert(`Erro ao carregar cep ${onerror}`)
            })

    } else {
        alert("Formato de CEP inválido.");
    }
}


async function recuperarSenha(form) {
    await auth.sendPasswordResetEmail(form.email.value).then(function () {
        alert('E-mail enviado com sucesso!Por favor verifique a sua caixa de entrada')
    }).catch(function (error) {
        alert('Não foi possivel recuperar ou encontrar o e-mail informado')
        console.error(`Erro ao recuperar e-mail ${error}`)
    });

    form.email.value = null;
    closeModalForgotPassword()
}

/*Modals*/

/*Modal Cadastro*/
function modalCadastro() {
    const modal = document.getElementById("modalCadastro")
    modal.style.display = 'block';
}

function fecharModalCadastro() {
    const modal = document.getElementById("modalCadastro")
    modal.style.display = 'none';
}

/* Modal Forgot password */
function openModalForgotPassword() {
    const modal = document.getElementById('modal-forgot-password')
    modal.style.display = 'block';
}

function closeModalForgotPassword() {
    const modal = document.getElementById('modal-forgot-password')
    modal.style.display = 'none';
}

/* Modal generica */
function modalGenerica() {
    let modal = document.getElementById("modal-generica")

    //Adicionando nome do usuario logado
    document.getElementById('nome-usuario-modal-generica').textContent = usuarioLogado.name

    //Adicionando foto do usuario logado
    let fotoUsuario = document.getElementById('foto-usuario-modal-generica');
    fotoUsuario.alt = usuarioLogado.name
    fotoUsuario.src = usuarioLogado.photoUrl !== '' ? usuarioLogado.photoUrl : "public/profile/foto-usuario-perfil.svg"

    modal.style.display = "block"
    document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    const entradaDeDados = document.getElementById("modal-generica-entrada-de-dados")
    entradaDeDados.focus()

    // Identifica qual a modal ativa
    let botaoPublicacao = modal.children[0].children[5].children[2].children[0];
    identificaTipoDeModal(botaoPublicacao)
}


function fecharModalGenerica() {
    let modal = document.getElementById("modal-generica")
    modal.style.display = "none"
    document.body.style.overflow = "auto" // exibir a barra de scroll quando fechamos a modal
}

/*add imagem na modal generica*/
function addImgModal(element) {

    let sessaoCarregamento

    switch (element.dataset.name) {

        case 'imoveis':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-imoveis")
            break;
        case 'generica':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-generica")
            break;
        case 'doacoes':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-doacoes")
            break;
    }

    const arquivos = Array.from(element.files)

    arquivos.forEach(arquivo => { //selecionando cada arquivo e criando elementos e dando estilos

        const div = document.createElement("div");
        div.classList.add("imagens-carregadas-container-itens");//add classe css a div
        const img = document.createElement("img");
        img.src = URL.createObjectURL(arquivo) // passando a url para o src
        img.classList.add("imagem-post-modal");
        div.appendChild(img);
        sessaoCarregamento.appendChild(div);
    })
    element.value = null;//limpando o input
}

async function uploadToFirebaseStorage(fileUrl, type) {

    let file = await downloadBlobFromMemory(fileUrl);

    let storageRefFile
    if (type === 'user') {
        storageRefFile = usersFilesStorage
    } else {
        storageRefFile = feedsFilesStorage
    }
    return await storageRefFile.child('/' + uuid()).put(file)
        .then(snapshot => {
            return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        })
        .catch(error => {
            console.log(`Failed to upload file and get link - ${error}`);
        })
        .catch(onerror => {
            console.log(`Erro ao baixar arquivo da modal - ${onerror}`)
        })
}

async function downloadBlobFromMemory(fileUrl) {
    return await fetch(fileUrl)
        .then(response => response.blob());
}

/*add video na modal generica*/
function addVideoModal(element) {
    let sessaoCarregamento

    switch (element.dataset.name) {

        case 'imoveis':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-imoveis")
            break;
        case 'generica':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-generica")
            break;
        case 'doacoes':
            sessaoCarregamento = document.getElementById("arquivos-modal-post-doacoes")
            break;
    }

    const arquivos = Array.from(element.files)


    arquivos.forEach(arquivo => { //selecionando cada arquivo e criando elementos e dando estilos

        const div = document.createElement("div");
        div.classList.add("imagens-carregadas-container-itens");//add classe css a div
        const video = document.createElement("video");
        video.src = URL.createObjectURL(arquivo) // passando a url para o src
        video.classList.add("imagem-post-modal");
        video.setAttribute("controls", "")//add play,volume...
        div.appendChild(video);
        sessaoCarregamento.appendChild(div);
    })
    element.value = null;//limpando o input
}

/* Modal Casa*/

function modalCasa() {
    let modal = document.getElementById("modal-casa")

    // Adicionando nome de usuario logado
    document.getElementById('nome-usuario-modal-imoveis').textContent = usuarioLogado.name

    //Adicionando foto do usuario logado
    let fotoUsuario = document.getElementById('foto-usuario-modal-imoveis');
    fotoUsuario.alt = usuarioLogado.name;
    fotoUsuario.src = usuarioLogado.photoUrl !== '' ? usuarioLogado.photoUrl : "public/profile/foto-usuario-perfil.svg";

    modal.style.display = "block"
    document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    const entradaDeDados = document.getElementById("modal-imovel-entrada-de-dados")
    entradaDeDados.focus()

    // Identifica qual a modal ativa
    let botaoPublicacao = modal.children[0].children[6].children[0];
    identificaTipoDeModal(botaoPublicacao)
}

function fecharModalCasa() {
    let modal = document.getElementById("modal-casa")
    modal.style.display = "none"
    document.body.style.overflow = "auto" // exibir a barra de scroll quando fechamos a modal
}

/*seleciona a opcao de tag*/
function selecionandoTagImoveis(element) {
    element.classList.toggle("modal-casa-opcao-ativo")

    switch (element.dataset.tipo) {
        case 'vendendo':
            document.getElementById("opcao-alugando").classList.remove("modal-casa-opcao-ativo");
            document.getElementById("opcao-procurando").classList.remove("modal-casa-opcao-ativo");
            break;

        case 'alugando':
            document.getElementById("opcao-procurando").classList.remove("modal-casa-opcao-ativo");
            document.getElementById("opcao-vendendo").classList.remove("modal-casa-opcao-ativo");
            break;
        case 'procurando':
            document.getElementById("opcao-vendendo").classList.remove("modal-casa-opcao-ativo");
            document.getElementById("opcao-alugando").classList.remove("modal-casa-opcao-ativo");
            break;
    }
}

/* Modal doacoes*/

function modalDoacoes() {
    let modal = document.getElementById("modal-doacoes")

    // Adicionando nome de usuario logado
    document.getElementById('nome-usuario-modal-doacoes').textContent = usuarioLogado.name

    //Adicionando foto do usuario logado
    let fotoUsuario = document.getElementById('foto-usuario-modal-doacoes');
    fotoUsuario.alt = usuarioLogado.name;
    fotoUsuario.src = usuarioLogado.photoUrl !== '' ? usuarioLogado.photoUrl : "public/profile/foto-usuario-perfil.svg";

    modal.style.display = "block"
    document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    const entradaDeDados = document.getElementById("modal-doacoes-entrada-de-dados")
    entradaDeDados.focus()

    // Identifica qual a modal ativa
    let botaoPublicacao = modal.children[0].children[5].children[2].children[0];
    identificaTipoDeModal(botaoPublicacao)
}

function fecharModalDoacoes() {
    let modal = document.getElementById("modal-doacoes")
    modal.style.display = "none"
    document.body.style.overflow = "auto" // exibir a barra de scroll quando fechamos a modal
}

function identificaTipoDeModal(elemento) {
    const menuAtivo = procurarMenuNavAtivo().dataset.name
    elemento.setAttribute('data-tipo', menuAtivo)
}

/*selecionando a opcao de tag*/
function selecionandoTagDoacoes(element) {
    element.classList.toggle("modal-doacoes-opcao-ativo")

    switch (element.dataset.tipo) {
        case 'doando':
            document.getElementById("opcao-help").classList.remove("modal-doacoes-opcao-ativo");
            break;
        case 'help':
            document.getElementById("opcao-doando").classList.remove("modal-doacoes-opcao-ativo");
            break;
    }

}

/**
 * Exibe modal de cada menu
 */
function exibirModal() {

    const tipoDeMenuNavAtivo = procurarMenuNavAtivo('tipo');

    if (tipoDeMenuNavAtivo !== undefined) {
        switch (tipoDeMenuNavAtivo) {
            case 'generico':
                modalGenerica();
                break;
            case 'casa':
                modalCasa();
                break;
            case 'doacoes':
                modalDoacoes();
                break;
            default:
                break;
        }
    }
}

/*Feed*/
async function publicarPost(tipoModal) {

    let elementoPost  //colocando a div "entrada-de-dados" do html dentro da const elemento Post
    let imgPostModal

    switch (tipoModal.dataset.name) {

        case 'generica':
            elementoPost = document.getElementById("modal-generica-entrada-de-dados")
            imgPostModal = document.getElementById("arquivos-modal-post-generica");
            break;
        case 'doacoes':
            elementoPost = document.getElementById("modal-doacoes-entrada-de-dados")
            imgPostModal = document.getElementById("arquivos-modal-post-doacoes");
            break;
        case 'imovel':
            elementoPost = document.getElementById("modal-imovel-entrada-de-dados")
            imgPostModal = document.getElementById("arquivos-modal-post-imoveis");
            break;
    }

    const conteudoPost = elementoPost.innerText // acessando o texto da div do modal post
    const recuperarSessao = document.getElementById("sessao-de-post"); // colocando a sessao de post do html dentro da const recuperarSessao

    // criando a div principal(container)
    const criandoDiv = document.createElement("div") // div principal, div container
    criandoDiv.classList.add('post', 'container', 'border')// div que criamos no js herdar o estilo css que criamos na div do html
    criandoDiv.setAttribute('id', uuid());
    criandoDiv.setAttribute('data-tipo', tipoModal.dataset.tipo)
    // criando a div que amarra nome do usuario e foto
    const divInformacaoDoUsuario = document.createElement("div")// criando div que amarra foto de perfil e nome do post
    divInformacaoDoUsuario.className = "usuario_post" //estilo da div
    criandoDiv.setAttribute('id', uuid());
    criandoDiv.setAttribute('data-tipo', tipoModal.dataset.tipo)

    // criando a foto do usuario no post
    const fotoDoUsuario = document.createElement("img") // criando img
    fotoDoUsuario.className = "img_post" // estilo da img
    fotoDoUsuario.src = usuarioLogado.photoUrl !== '' ? usuarioLogado.photoUrl : "public/profile/foto-usuario-perfil.svg"
    fotoDoUsuario.alt = usuarioLogado.name;

    // criando nome do usuario
    const nomeUsuario = document.createElement("h3")
    nomeUsuario.innerText = usuarioLogado.name;
    nomeUsuario.setAttribute('data-userId', usuarioLogado.id)
    nomeUsuario.setAttribute('onclick', 'loadProfile(this)');
    nomeUsuario.setAttribute('name', 'user-name')

    //criando a modal apagar post
    const ulPrincipalApagarPost = document.createElement('ul')
    ulPrincipalApagarPost.classList.add('reticencias')
    ulPrincipalApagarPost.setAttribute('data-owner', usuarioLogado.id)

    const liApagarPost = document.createElement('li')

    const btnApagarPost = document.createElement('img')
    btnApagarPost.className = "btn-apagar-post"
    btnApagarPost.src = "public/feed/icone-reticencias.svg"
    btnApagarPost.setAttribute('onclick', 'modalApagarPost(this)')
    btnApagarPost.setAttribute('data-tipo', 'apagar-post');

    const ulModalApagarPost = document.createElement('ul')
    ulModalApagarPost.className = "dropdown-apagar-post"

    const divTrianguloUp = document.createElement('div')
    divTrianguloUp.className = "triangulo-up-borda-dropdown"

    const divTrianguloDown = document.createElement('div')
    divTrianguloDown.className = "triangulo-down-borda-dropdown"

    const liModalApagarPost = document.createElement('li')
    liModalApagarPost.className = "apagar-post"
    liModalApagarPost.setAttribute('onclick', 'apagarPost(this)')

    const iconeModalApagarPost = document.createElement('img')
    iconeModalApagarPost.src = 'public/feed/icone-lixeira.svg'

    const textoModalApagarPost = document.createElement('p')
    textoModalApagarPost.textContent = 'Apagar post'

    //seção emojis e contador de comentarios
    const divEmojisAdicionados = document.createElement('div')
    divEmojisAdicionados.className = 'interacao-emojis-adicionados'
    divEmojisAdicionados.setAttribute('name', 'interacao-emojis-adicionados')

    const secaoInteracaoPost = document.createElement('section')
    secaoInteracaoPost.className = 'interacao-post'

    const btnEscolherEmoji = document.createElement('img')
    btnEscolherEmoji.src = 'public/feed/btn-emoji.svg'
    btnEscolherEmoji.className = 'escolher-emoji'
    btnEscolherEmoji.setAttribute('onclick', 'hideEmojis(this)')

    const divEscolherEmoji = document.createElement('div')
    divEscolherEmoji.className = 'interacao-emojis'

    const emojiSmile = document.createElement('img')
    emojiSmile.src = 'public/feed/emoji-smile.svg'
    emojiSmile.setAttribute('onclick', 'addEmojis(this)')
    emojiSmile.setAttribute('data-name', 'smile')

    const emojiDissapointed = document.createElement('img')
    emojiDissapointed.src = 'public/feed/emoji-dissapointed.svg'
    emojiDissapointed.setAttribute('onclick', 'addEmojis(this)')
    emojiDissapointed.setAttribute('data-name', 'dissapointed')

    const emojiLove = document.createElement('img')
    emojiLove.src = 'public/feed/emoji-love.svg'
    emojiLove.setAttribute('onclick', 'addEmojis(this)')
    emojiLove.setAttribute('data-name', 'love')

    const emojiFurious = document.createElement('img')
    emojiFurious.src = 'public/feed/emoji-furious.svg'
    emojiFurious.setAttribute('onclick', 'addEmojis(this)')
    emojiFurious.setAttribute('data-name', 'angry')


    //Criando contador de comentarios
    const contadorDeComentarios = document.createElement('p')
    contadorDeComentarios.classList.add('call-comentarios')
    contadorDeComentarios.innerText = '0 Comentário(s)'
    contadorDeComentarios.setAttribute('name', 'contadorDeComentarios')

    /*Associando pais e filhos da secao interacao*/

    divEscolherEmoji.append(emojiSmile, emojiDissapointed, emojiLove, emojiFurious);
    secaoInteracaoPost.append(btnEscolherEmoji, divEscolherEmoji, contadorDeComentarios);


    //div que recebe o valor das divTags
    let divTagConstruida
    if (tipoModal.dataset.name !== 'generica') {

        // Verifica se estamos na modal imoveis
        if (tipoModal.dataset.name === "imovel") {
            let opcaoModalImoveis

            // Buscamos todos os p e verificamos se possui a classe ativa e depois removemos a classe
            document.querySelectorAll('p').forEach(opcao => {
                if (opcao.classList.contains('modal-casa-opcao-ativo')) {
                    opcaoModalImoveis = opcao;
                    opcao.classList.remove('modal-casa-opcao-ativo');
                }
            })
            if (opcaoModalImoveis === undefined) {
                alert('Por favor selecione a opção (Vendendo), (Alugando) ou (Procurando');
                return;
            }
            //recuperando os valores dos inputs da modal imoveis
            let tipoDeImovel = document.getElementById('tipoImovel-input').value;
            let inputValor = document.getElementById('valorImovel-input').value;


            //construindo as tags
            const divTags = document.createElement('div');//div principal
            divTags.classList.add('tags')

            //tag opcao
            const divOpcao = document.createElement('div');
            divOpcao.classList.add('opcao-tag');
            const conteudoOpcao = document.createElement('p'); //alugando,vendendo,comprando
            conteudoOpcao.classList.add('tag-child');
            conteudoOpcao.textContent = opcaoModalImoveis.textContent; //colocando o conteudo dentro do p

            //tag tipo
            const divTipo = document.createElement('div');
            divTipo.classList.add('tiposImoveis-tag');
            const conteudoTipo = document.createElement('p'); //loft,casa,apartamento...opcoes do select
            conteudoTipo.classList.add('tag-child');
            conteudoTipo.textContent = tipoDeImovel;
            document.getElementById('valorImovel-input').value = null;


            //tag valor
            const divValor = document.createElement('div');
            divValor.classList.add('valor-tag');
            const conteudoValor = document.createElement('p');
            conteudoValor.classList.add('tag-child');
            conteudoValor.textContent = inputValor;
            document.getElementById('tipoImovel-input').value = null;

            //associando os elementos
            if (conteudoTipo.textContent) {
                divTipo.appendChild(conteudoTipo);
            }

            if (conteudoValor.textContent) {
                divValor.appendChild(conteudoValor);
            }

            divOpcao.appendChild(conteudoOpcao);
            divTags.append(divTipo, divValor, divOpcao);
            divTagConstruida = divTags;
        }

        //recuperando a opcao da modal doacoes e criando as tags do post
        // Verifica se estamos na modal doacoes
        if (tipoModal.dataset.name === "doacoes") {

            // Construindo divs para as tags
            const divTag = document.createElement('div');
            divTag.classList.add('tags');
            const tipoTag = document.createElement('div');

            let opcaoModalDoacoes

            // Buscamos todos os p e verificamos se possui a classe ativa e depois removemos a classe
            document.querySelectorAll("p").forEach(opcao => {
                if (opcao.classList.contains('modal-doacoes-opcao-ativo')) {
                    opcaoModalDoacoes = opcao
                    opcao.classList.remove('modal-doacoes-opcao-ativo')
                }
            })

            if (opcaoModalDoacoes === undefined) {
                alert('Por favor selecione a opção (Doando) ou (Pedido de doação)')
                return;
            }

            if (opcaoModalDoacoes.dataset.tipo === 'doando') { //p
                tipoTag.classList.add('donation-tag')

            } else if (opcaoModalDoacoes.dataset.tipo === 'help') {
                tipoTag.classList.add('help-tag')
            }

            const conteudoTag = document.createElement('p');
            conteudoTag.classList.add('tag-child');
            conteudoTag.textContent = opcaoModalDoacoes.textContent;

            //associando as tags
            tipoTag.appendChild(conteudoTag);
            divTag.append(tipoTag);
            divTagConstruida = divTag
        }
    }

    // criando paragrafo do post
    const paragrafo = document.createElement("p")
    paragrafo.className = "texto_publicacao" // associando o estilo css para a tag crianda
    paragrafo.innerText = conteudoPost // colocando o conteudo que conseguimos acessar da modal
    elementoPost.textContent = null // limpando o texto da modal apos a publicaçao,para as futuras publicaçoes a modal estar sem nenhum texto

    //criando o carrosel das imgs do post
    const divPrincipalCarrosel = document.createElement("div");
    divPrincipalCarrosel.classList.add('splide');
    const divCarrosel = document.createElement("div");
    divCarrosel.classList.add('splide__track');
    const ulCarrosel = document.createElement("ul");
    ulCarrosel.classList.add('splide__list');

    //criando a img do post
    for (let i = 0; i < imgPostModal.children.length; i++) {
        let arquivoDaModal = imgPostModal.children[i].children[0]
        let arquivoDoPost
        if (arquivoDaModal.nodeName.toLowerCase() === "img") {
            arquivoDoPost = document.createElement("img") // criando img
        } else if (arquivoDaModal.nodeName.toLowerCase() === "video") {
            arquivoDoPost = document.createElement("video") // criando video
            arquivoDoPost.setAttribute("controls", "")//add play,volume...
        }
        arquivoDoPost.className = "publicacao" // estilo da img
        arquivoDoPost.src = await uploadToFirebaseStorage(arquivoDaModal.src, 'feeds');
        const liCarrosel = document.createElement("li");
        liCarrosel.classList.add('splide__slide');
        liCarrosel.appendChild(arquivoDoPost);
        ulCarrosel.appendChild(liCarrosel);
    }
    divCarrosel.appendChild(ulCarrosel);
    divPrincipalCarrosel.appendChild(divCarrosel);

    // Removendo elementos img da modal
    imgPostModal.textContent = null;


    // criando area de comentarios
    const divSessaoComentarios = document.createElement('section')
    divSessaoComentarios.setAttribute('name', 'comments-section');

    //aparador
    const aparador = document.createElement("hr");
    aparador.className = "aparador-post"; //estilo

    //div
    const divComentarios = document.createElement("div");
    divComentarios.className = "area_comentarios"; // estilo

    //div da img
    const divComentariosFlex = document.createElement("div");
    divComentariosFlex.classList.add("area_comentarios_flex", "comentario-perfil")

    //img
    const usuarioComentarioImg = document.createElement("img");
    usuarioComentarioImg.className = "img_comentario";
    usuarioComentarioImg.src = "public/profile/foto-usuario-perfil.svg"
    usuarioComentarioImg.setAttribute('name', 'foto-user')

    //div do input
    const divComentariosFlexInput = document.createElement("div");
    divComentariosFlexInput.classList.add("area_comentarios_flex", "comentario-perfil")

    //input
    const comentarioUsuario = document.createElement("input");
    comentarioUsuario.type = "text";
    comentarioUsuario.placeholder = "Escreva um comentário";
    comentarioUsuario.setAttribute('onkeyup', 'addComentario(event)');
    comentarioUsuario.name = 'input-comentarios'

    //associando pais e filhos

    liModalApagarPost.append(iconeModalApagarPost, textoModalApagarPost);
    ulModalApagarPost.append(divTrianguloUp, divTrianguloDown, liModalApagarPost);
    liApagarPost.append(btnApagarPost, ulModalApagarPost);
    ulPrincipalApagarPost.append(liApagarPost);
    divInformacaoDoUsuario.append(fotoDoUsuario);
    divInformacaoDoUsuario.append(nomeUsuario);
    // Se a div tag tiver valor adicionamos ela no feed
    if (divTagConstruida !== undefined) {
        divInformacaoDoUsuario.append(divTagConstruida);
    }
    divInformacaoDoUsuario.append(ulPrincipalApagarPost);

    divComentariosFlex.appendChild(usuarioComentarioImg);
    divComentarios.appendChild(divComentariosFlex);
    divComentariosFlexInput.appendChild(comentarioUsuario);
    divComentarios.appendChild(divComentariosFlexInput);
    criandoDiv.prepend(divInformacaoDoUsuario); // prepend para ele ser sempre o que veem em primeiro no post
    criandoDiv.append(paragrafo);
    if (ulCarrosel.children.length > 0) {
        criandoDiv.append(divPrincipalCarrosel);
    }
    criandoDiv.append(divEmojisAdicionados);
    criandoDiv.append(secaoInteracaoPost);
    criandoDiv.append(divSessaoComentarios);
    criandoDiv.append(aparador);
    criandoDiv.append(divComentarios);

    recuperarSessao.prepend(criandoDiv); // jogando a div que criamos dentro da sessao, para isso associamos a div como filho da sessao

    switch (tipoModal.dataset.name) {
        case 'generica':
            fecharModalGenerica();
            break;
        case 'doacoes':
            fecharModalDoacoes();
            break;
        case 'imovel':
            fecharModalCasa();
            break;
    }
    salvarFeeds(tipoModal.dataset.tipo, criandoDiv.id, criandoDiv.innerHTML, true)

    if (ulCarrosel.children.length > 0) {
        new Splide('.splide').mount();//carrosel img
    }
}

/**
 * abrir modal com a opcao apagar post
 * @param element
 */
function modalApagarPost(element) {
    const modalApagarPost = element.nextElementSibling
    hideOnClickOutside(element)
    modalApagarPost.classList.toggle("dropdown-apagar-post-ativo");
}

/**
 * Apaga o post
 * @param element
 */
async function apagarPost(element) {
    const divFather = element.parentNode.parentNode.parentNode.parentNode.parentNode;//acessando a div que tem o id do post
    const idDivFather = divFather.id;
    const topico = divFather.dataset.tipo;
    const menuNavAtivo = procurarMenuNavAtivo();

    const path = `/feedsCollection/${usuarioLogado.neighborhood}/${topico}`//caminho do banco de dados
    await db.collection(path).doc(idDivFather).delete().then(() => { //deletando do banco de dados
        alert('Publicação excluida com sucesso')
        loadFeed(menuNavAtivo)
    }).catch((erro) => { //caso ocorra erro
        alert('Erro ao excluir publicação, por favor tente novamente')
        console.log('Erro ao excluir', erro)
    })

}


/**
 * Adiciona comentario ao post
 * @param event A acao que o usuario esta fazendo
 */
function addComentario(event) {

    if (event.key === 'Enter' || event.keyCode === 13) {

        const comment = event.target.value;

        const divPost = event.target.parentNode.parentNode.parentNode;

        const postId = divPost.id;

        const tipoFeed = divPost.dataset.tipo;

        const section = divPost.children.namedItem('comments-section')
        const contadorDeComentarios = divPost.children.item(3).children.namedItem('contadorDeComentarios');

        const divComentarios = document.createElement("div");
        divComentarios.className = "area_comentarios";

        //div da img
        const divComentariosFlex = document.createElement("div");
        divComentariosFlex.classList.add("area_comentarios_flex")

        //img
        const usuarioComentarioImg = document.createElement("img");
        usuarioComentarioImg.className = "img_comentario";
        usuarioComentarioImg.src = usuarioLogado.photoUrl
        usuarioComentarioImg.setAttribute("title", usuarioLogado.name);
        usuarioComentarioImg.setAttribute('data-userId', usuarioLogado.id);
        usuarioComentarioImg.setAttribute('onclick', 'loadProfile(this)');
        usuarioComentarioImg.setAttribute('name', 'user-name')

        //div do input
        const divComentariosFlexInput = document.createElement("div");
        divComentariosFlexInput.classList.add("area_comentarios_body");

        const inputComentario = document.createElement('p');
        inputComentario.innerText = comment;

        //Nome do usuario
        const usuarioComentario = document.createElement('span');
        usuarioComentario.innerText = usuarioLogado.name;
        usuarioComentario.classList.add("area_comentarios");
        usuarioComentario.setAttribute('data-userId', usuarioLogado.id);
        usuarioComentario.setAttribute('onclick', 'loadProfile(this)');
        usuarioComentario.setAttribute('name', 'user-name')

        divComentariosFlexInput.append(usuarioComentario, inputComentario);
        divComentariosFlex.appendChild(usuarioComentarioImg);
        divComentarios.appendChild(divComentariosFlex);
        divComentariosFlex.appendChild(divComentariosFlexInput);
        section.prepend(divComentarios);

        const quantidadeDeComentarios = section.children.length;

        contadorDeComentarios.innerText = quantidadeDeComentarios + ' Comentário(s)';

        event.target.value = null;

        salvarFeeds(tipoFeed, postId, divPost.innerHTML, false);
    }
}

/**
 * Salva feed na localstorage
 * @param tipoFeed exemplo 'feedNoticias'...
 * @param postId
 * @param {InnerHTML} post Post que deve ser salvo
 * @param novoFeed
 */
async function salvarFeeds(tipoFeed, postId, post, novoFeed) {

    if (novoFeed) {

        await feedsRef.doc(usuarioLogado.neighborhood).get().then(bairro => {
            if (!bairro.exist) {
                feedsRef.doc(usuarioLogado.neighborhood).set({
                    id: uuid()
                }).then(() => {
                    feedsRef.doc(usuarioLogado.neighborhood).collection(tipoFeed)
                        .doc(postId)
                        .set({
                            html: post,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            owner: usuarioLogado.id
                        })
                })
            } else {
                feedsRef.doc(usuarioLogado.neighborhood).collection(tipoFeed)
                    .doc(postId)
                    .set({
                        html: post,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        owner: usuarioLogado.id
                    })
            }
        })
    } else {
        feedsRef.doc(usuarioLogado.neighborhood)
            .collection(tipoFeed)
            .doc(postId)
            .update({
                html: post,
            }, {merge: true});
    }
}

/*Header*/

/*modal bairro*/

async function abrirModalBairro(event) {

    if (event.type === 'change') {

        const nomeBairro = document.getElementById('bairro'); //nome do bairro que esta no header
        const bairroSelecionado = document.getElementById('header_search'); //bairro que seleciona no pesquisar

        let bairrosDisponiveis = await recuperaTodosBairros()

        if (!bairrosDisponiveis.includes(bairroSelecionado.value)) {
            alert('Infelizmente ainda não existem moradores nesse bairro que você pesquisou, selecione um bairro disponível na lista.')
            return;
        }

        sessionStorage.setItem('bairroSelecionado', JSON.stringify(bairroSelecionado.value))
        nomeBairro.textContent = bairroSelecionado.value;

        await loadFeed();
        const modalBairros = document.getElementById('modal-bairros');
        modalBairros.style.display = 'block';
        document.body.style.overflow = "hidden" // removendo o scroll da pag quando abre a modal
    }
}

function fecharModalBairros() {
    espiadinha();
}

function espiadinha() {
    const comecarPublicacao = document.getElementById('btn-comecar-publicacao');
    comecarPublicacao.removeAttribute('onclick');
    comecarPublicacao.style.cursor = 'not-allowed';

    const listaInputComentario = document.getElementsByName('input-comentarios');

    const nomeUsuarioPost = document.getElementsByName('user-name');

    for (let nameUser of nomeUsuarioPost) {
        nameUser.style.cursor = 'not-allowed';
        nameUser.removeAttribute('onclick');
    }

    for (let input of listaInputComentario) {
        input.style.cursor = 'not-allowed';
        input.setAttribute('disabled', '');
    }

    const apagarPost = document.getElementsByClassName('reticencias');
    for (let apagarPostElement of apagarPost) {
        apagarPostElement.style.display = 'none'
    }

    const emojis = document.getElementsByClassName('interacao-emojis')
    const divEmoji = document.getElementsByClassName('escolher-emoji')[0]
    divEmoji.removeAttribute('onclick');

    for(let emoji of emojis){
        emoji.style.cursor = 'not-allowed';
        emoji.removeAttribute('onclick');
    }

    sessionStorage.setItem('espiadinha', 'true')

    document.getElementById("home-icon").children[0].classList.remove("icone-home-ativo");

    const inputSearch = document.getElementById('header_search');
    inputSearch.value = null
    const modalBairros = document.getElementById('modal-bairros');
    modalBairros.style.display = 'none';
    document.body.style.overflow = "auto"
}

async function mudarBairro() {
    const nomeBairro = document.getElementById('bairro');
    nomeBairro.textContent = usuarioLogado.neighborhood;
    const inputSearch = document.getElementById('header_search');
    inputSearch.value = null

    await loadSettings()
}

/**
 * Adiciona class permahover para exibir a modal e so desaparecer quando clicar novamente.
 * @param elemento li dos icons do header
 */
function adicionaPermaHoverClass(elemento) {

    switch (elemento.dataset.tipo) {
        case 'notifications':
            elemento.classList.toggle("permahover-notifications");
            document.getElementById("profile-icon").classList.remove("permahover-profile");
            elemento.children[0].classList.toggle("icone-notificacao-ativo");
            hideOnClickOutside(elemento);
            document.getElementById("profile-icon").children[0].classList.remove("icone-perfil-ativo");
            document.getElementById("home-icon").children[0].classList.remove("icone-home-ativo");
            break;
        case 'profile':
            elemento.classList.toggle("permahover-profile");
            document.getElementById("notifications-icon").classList.remove("permahover-notifications");
            document.getElementById("notifications-icon").children[0].classList.remove("icone-notificacao-ativo");
            document.getElementById("home-icon").children[0].classList.remove("icone-home-ativo");
            hideOnClickOutside(elemento);
            elemento.children[0].classList.toggle("icone-perfil-ativo");
            break;

    }
}

/**
 * Esconde dropdown sub menu ao clicar fora
 * @param elemento elemento que esta sendo clicado (ex: icone perfil / icone notificações)
 */
function hideOnClickOutside(elemento) {
    const outsideClickListener = event => {
        if (!elemento.contains(event.target) && isVisible(elemento)) {

            if (elemento.dataset.tipo === 'profile') {
                elemento.classList.remove("permahover-profile");
                elemento.children[0].classList.remove("icone-perfil-ativo");
            } else if (elemento.dataset.tipo === 'notifications') {
                elemento.classList.remove("permahover-notifications");
                elemento.children[0].classList.remove("icone-notificacao-ativo");
            } else if (elemento.dataset.tipo === 'apagar-post') {
                elemento.nextElementSibling.classList.remove('dropdown-apagar-post-ativo');
            }
            removeClickListener()
        }
    }

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener)
    }

    document.addEventListener('click', outsideClickListener)
}

/* Utils */

// Verifica se o elemento está visível na tela
const isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)

/**
 * Procura qual menu nav esta ativo
 * @returns retorna o tipo do nav que esta ativo (exemplo generico,casa,doacoes)
 */
function procurarMenuNavAtivo(retorno) {

    const activeClassName = 'active_menu_nav';

    const menuNavUl = document.getElementById("menu-nav-ul");

    for (let i = 0; i < menuNavUl.children.length; i++) {
        const menuNavLi = menuNavUl.children[i];

        for (let i = 0; i < menuNavLi.children.length; i++) {
            if (menuNavLi.children[i].classList.contains(activeClassName)) {
                if (retorno === 'tipo') {
                    return menuNavLi.children[i].dataset.tipo;
                } else {
                    return menuNavLi.children[i];
                }

            }
        }
    }
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function reloadPage() {

    if (sessionStorage.getItem('espiadinha')) {
        sessionStorage.removeItem('espiadinha')
    }

    location.reload();
}

/*Perfil*/

/*liberando os campos para editar*/
function editarPerfil(element) {
    element.style.display = 'none';

    let editarTrabalho = document.getElementById("perfil-trabalho");
    editarTrabalho.setAttribute("contenteditable", "true");
    editarTrabalho.focus();

    let editarCidade = document.getElementById("perfil-local");
    editarCidade.setAttribute("contenteditable", "true");

    let editarRelacionamento = document.getElementById("perfil-relacionamento");
    editarRelacionamento.setAttribute("contenteditable", "true");

    let editarHobbies = document.getElementById("perfil-hobbies");
    editarHobbies.setAttribute("contenteditable", "true");

    let editarTelefone = document.getElementById("perfil-mobile");
    editarTelefone.setAttribute("contenteditable", "true");

    let editarAbout = document.getElementById("perfil-about");
    editarAbout.setAttribute("contenteditable", "true");
    editarAbout.classList.add('header-profile-about-conteudo-ativo');

    let salvarDados = document.getElementById("perfil-btn-salvar");
    salvarDados.style.display = 'block';
}

/*voltado para o estado inicial depois que salvar*/
async function salvandoDadosPerfil(element) {
    element.style.display = 'none';

    let editarPerfil = document.getElementById('edit-profile');
    editarPerfil.style.display = 'block'

    let editarTrabalho = document.getElementById("perfil-trabalho");
    editarTrabalho.setAttribute("contenteditable", "false");
    editarTrabalho.focus();

    let editarCidade = document.getElementById("perfil-local");
    editarCidade.setAttribute("contenteditable", "false");

    let editarRelacionamento = document.getElementById("perfil-relacionamento");
    editarRelacionamento.setAttribute("contenteditable", "false");

    let editarHobbies = document.getElementById("perfil-hobbies");
    editarHobbies.setAttribute("contenteditable", "false");

    let editarTelefone = document.getElementById("perfil-mobile");
    editarTelefone.setAttribute("contenteditable", "false");

    let editarAbout = document.getElementById("perfil-about");
    editarAbout.setAttribute("contenteditable", "false");
    editarAbout.classList.remove('header-profile-about-conteudo-ativo');

    await updateUserProfile(
        usuarioLogado.id,
        editarHobbies.textContent,
        editarTelefone.textContent,
        editarRelacionamento.textContent,
        editarTrabalho.textContent,
        editarCidade.textContent,
        editarAbout.textContent
    )
    await reloadUserProfile();
}

async function updateUserProfile(userId, hobbies, mobile, relationship, work, location, about) {
    await usersRef
        .doc(userId)
        .update({
            hobbies: hobbies,
            mobile: mobile,
            relationship: relationship,
            work: work,
            location: location,
            about: about,
        })
        .then(() => {
            console.log("User updated");
        })
        .catch((error) => {
            console.error("Error updating user", error);
        });
}

async function changePhotoProfile(element) {
    let imageProfile = document.getElementById('foto-perfil');

    imageProfile.src = await uploadToFirebaseStorage(URL.createObjectURL(element.files[0]), 'user');

    await usersRef
        .doc(usuarioLogado.id)
        .update({
            photoUrl: imageProfile.src
        })
        .then(() => {
            console.log("User photo updated");
        })
        .catch((error) => {
            console.error("Error updating user photo", error);
        });

    await reloadUserProfile();

}

async function reloadUserProfile() {
    await loadUserDetails(usuarioLogado.id);
    usuarioLogado = JSON.parse(sessionStorage.getItem('loggedUser'));
}

function focusAbout() {
    document.getElementById('perfil-about').focus();
}

//settings
async function editarSettings(elemento) {

    const elementoInput = document.getElementById(elemento.dataset.id)

    switch (elemento.textContent) {

        case 'Editar':
            elementoInput.removeAttribute('disabled')
            elemento.textContent = 'Salvar'
            elementoInput.focus()
            break
        case 'Salvar':
            elementoInput.setAttribute('disabled', '')
            elemento.textContent = 'Editar'

            switch (elementoInput.name) {
                case 'email':
                    await firebase.auth().currentUser.updateEmail(elementoInput.value);
                    break;
                case 'password':
                    await firebase.auth().currentUser.updatePassword(elementoInput.value);
                    break;
                case 'name':
                    await usersRef
                        .doc(usuarioLogado.id)
                        .update({
                            name: elementoInput.value
                        })
                        .then(() => {
                            console.log("User updated");
                        })
                        .catch((error) => {
                            console.error("Error updating user", error);
                        });
                    break;
                case 'postalCode':
                    let inputBairro = document.getElementById('bairro-input-settings');
                    if (inputBairro.value === '...') {
                        await new Promise(r => setTimeout(r, 2000));
                    }
                    await usersRef
                        .doc(usuarioLogado.id)
                        .update({
                            postalCode: elementoInput.value,
                            neighborhood: inputBairro.value
                        })
                        .then(() => {
                            console.log("User updated");
                        })
                        .catch((error) => {
                            console.error("Error updating user", error);
                        });
                    break;
            }

            if (elementoInput.name === 'postalCode') {
                alert('Por favor faça login novamente')
                await logout()
                reloadPage()
            }
    }
}

function menuSettings(element) {

    const classAtivo = 'menu-settings-titulo-ativo'

    switch (element.dataset.name) {
        case 'conta':
            // Exibi conteudo do menu conta
            let menuContaAtivo = document.getElementById("settings-conta");
            menuContaAtivo.style.display = 'block';

            // Adiciona class ativa na div
            let divConta = document.getElementById('div-menu-settings-conta');
            divConta.classList.add(classAtivo);

            let menuSegurancaInativo = document.getElementById("settings-seguranca");
            menuSegurancaInativo.style.display = 'none';

            let menuSegurancaInativoH5 = document.getElementById('div-menu-settings-seguranca');
            menuSegurancaInativoH5.classList.remove(classAtivo);
            break;

        case 'seguranca':

            let menuSegurancaAtivo = document.getElementById("settings-seguranca");
            menuSegurancaAtivo.style.display = 'block';

            let divSeguranca = document.getElementById('div-menu-settings-seguranca');
            divSeguranca.classList.add(classAtivo);

            let menuContaInativo = document.getElementById("settings-conta");
            menuContaInativo.style.display = 'none';

            let menuContaInativoH5 = document.getElementById('div-menu-settings-conta');
            menuContaInativoH5.classList.remove(classAtivo);
            break;
    }

}


function formataMoeda(elemento) {
    const value = elemento.value.replace(/,/g, '');
    const valorFormatado = parseFloat(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    if (valorFormatado === 'R$ NaN') {
        elemento.value = null;
    } else {
        elemento.value = valorFormatado;
    }
}

/**
 * Esconde e exibi div emojis
 */
function hideEmojis(element) {

    const divEmojis = element.nextElementSibling;

    switch (divEmojis.style.display) {
        case 'flex':
            divEmojis.style.display = 'none';
            break;
        case 'none':
            divEmojis.style.display = 'flex';
            break;
        default:
            divEmojis.style.display = 'none';
            break;
    }
}

function addEmojis(element) {

    const divEmojisAdicionados = element.parentNode.parentNode.parentElement.children.namedItem('interacao-emojis-adicionados')

    const img = document.createElement('img')
    img.src = element.src;
    img.alt = element.alt;

    img.setAttribute('data-name', element.dataset.name)

    const emojisAdicionados = divEmojisAdicionados.children.length
    let emojiJaExiste = false;

    if (emojisAdicionados === 0) {
        divEmojisAdicionados.append(img)

        const contador = document.createElement('p')
        contador.setAttribute('data-name', img.dataset.name)
        contador.setAttribute('name', img.dataset.name)
        contador.classList.add('interacao-emojis-adicionados-contador')
        contador.textContent = '1';

        img.after(contador)
        emojiJaExiste = true;
    }

    for (let i = 0; i < emojisAdicionados; i++) {
        let emoji = divEmojisAdicionados.children[i];
        if (emoji.nodeName === "IMG") {
            if (emoji.dataset.name === img.dataset.name) {
                let contadores = document.getElementsByName(img.dataset.name)
                contadores.forEach(contador => {
                    if (contador.dataset.name === img.dataset.name) {
                        let count = Number(contador.textContent)
                        contador.textContent = count + 1;
                    }
                })
                emojiJaExiste = true;
                break;
            }
        }
    }

    if (!emojiJaExiste) {
        divEmojisAdicionados.append(img)
        const contador = document.createElement('p')
        contador.setAttribute('data-name', img.dataset.name)
        contador.setAttribute('name', img.dataset.name)
        contador.classList.add('interacao-emojis-adicionados-contador')
        contador.textContent = '1';
        img.after(contador)
    }

    hideEmojis(element.parentNode.parentNode.children.item(0))
}

// Verifica se a pagina foi recarregada
if (PerformanceNavigationTiming.type === PerformanceNavigationTiming.TYPE_RELOAD) {
    sessionStorage.removeItem('espiadinha')
    sessionStorage.removeItem('bairroSelecionado')
}
