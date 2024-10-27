import { auth, db } from './firebase_fe.js';
import { mostrarNotificacao } from '../scripts/alerts.js';

export function createAccount(email, password, name) {
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        
        return db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            xp: 0,
            level: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            plano: 'Gratuito',
            status_assinatura: false
        });
      })
    .then(() => {
        mostrarNotificacao('success', 'Conta criada com sucesso', 'Cadastro');
        return true;
    })
    .catch((error) => {
        if(error.code === 'auth/email-already-in-use'){
            mostrarNotificacao('error', 'Email ja em uso', 'Erro no Cadastro');
        }
        else if(error.code === 'auth/weak-password'){
            mostrarNotificacao('error', 'Senha muito fraca', 'Erro no Cadastro');
        }
        else if(error.code === 'auth/invalid-email'){
            mostrarNotificacao('error', 'Email invalido', 'Erro no Cadastro');
        }
    });
}
export function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        return true; 
      })
      .catch((error) => {
        mostrarNotificacao('error', error.message, 'Erro no Login');
        return false; 
      });
}
export function checkAuthStatus() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid);
        } else {
          window.location.href = '../../index.html';
        }
      });
    });
}
  
export function checkAuthStatusLogin() {
return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
    if (user) {
        console.log(user.uid);
        resolve(true);
    } else {
        console.log('nao logado');
        resolve(false)
    }
    });
});
}
export function logout() {
    auth.signOut();
    window.location.href = '../../index.html';
}