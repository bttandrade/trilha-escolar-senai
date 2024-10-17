import { login, checkAuthStatusLogin, createAccount } from '../firebase/firebase_function_fe.js';
import { mostrarNotificacao } from './alerts.js';


document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const isAuthenticated = await login(email, password);
    
    if (isAuthenticated) {
        window.location.href = './assets/pages/main.html';
    }
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email_register').value;
    const password = document.getElementById('password_register').value;
    const passwordRepeat = document.getElementById('password-repeat').value;

    if (password !== passwordRepeat) {
        mostrarNotificacao('error', 'As senhas devem ser iguais', 'Erro no Cadastro');
        return;
    }

    const name = document.getElementById('name').value;
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
