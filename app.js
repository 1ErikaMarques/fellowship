/* Feed */
function sharePost() {

    const shareInput = document.getElementById('share-entry').value;

    const postArea = document.getElementById('post-area');

    let para = document.createElement("p");
    para.id = uuid();
    para.className = 'post';
    let node = document.createTextNode(shareInput);
    para.appendChild(node);

    postArea.prepend(para);

    window.localStorage.setItem('Feed', JSON.stringify(postArea));
    window.stor

    console.log(postArea)
}


/*Login / Cadastro*/
/**
 * Usuario objeto
 * @param username o nome de usuario
 * @param email o email do usuario
 * @param password a senha do usuario
 * @returns {{password, email, username}}
 */
function addUser(username, email, password) {
    return {
        "username": username,
        "email": email,
        "password": password
    };
}

/**
 * Valida detalhes de usuario inserido
 * @param form o formulario de login
 */
function checkLogin(form) {

    if (form.username.value === '' || form.password.value === '') {
        return;
    }

    const userDetails = JSON.parse(window.localStorage.getItem('userDetails'))

    if (userDetails !== null) {
        let username = userDetails.username;
        let password = userDetails.password;

        if (form.username.value === username && form.password.value === password) {
            window.localStorage.setItem('loggedIn', form.username.value)
            window.location.reload();
        } else {
            alert('Please check your username/password')
        }
    } else {
        alert('Please register first')
    }
}

/**
 * Cadastra usuario e ativa sessao.
 * @param form formulario de cadastro
 */
function register(form) {
    const user = addUser(form.username.value, form.email.value, form.password.value);

    window.localStorage.setItem('userDetails', JSON.stringify(user));
    window.localStorage.setItem('loggedIn', 'yes');
}


/* Utils */

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}