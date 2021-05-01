/* Feed */

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