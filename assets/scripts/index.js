import { login, checkAuthStatusLogin, createAccount } from '../firebase/firebase_function_fe.js';
import { mostrarNotificacao } from './alerts.js';

const container = document.getElementById('container');
const signUpButton = document.querySelector('.overlay-right button');
const signInButton = document.querySelector('.overlay-left button');

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});


document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    const isAuthenticated = await login(email, password);
    
    if (isAuthenticated) {
        window.location.href = './assets/pages/main.html';
    }
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-create').value;
    const password = document.getElementById('password-create').value;
    const passwordRepeat = document.getElementById('confirm-password-create').value;

    if (password !== passwordRepeat) {
        mostrarNotificacao('error', 'As senhas devem ser iguais', 'Erro no Cadastro');
        return;
    }

    const name = document.getElementById('name-create').value;
    const accountCreated = createAccount(email, password, name);

    if (accountCreated) {
        window.location.href = './assets/pages/main.html';
    }
});

(async function checkIfLoggedIn() {
    const isLoggedIn = await checkAuthStatusLogin();
    if (isLoggedIn) {
        window.location.href = './assets/pages/main.html';
    }
})();