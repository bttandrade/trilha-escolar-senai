import { checkAuthStatus, logout } from "../firebase/firebase_function_fe.js";
import { db } from "../firebase/firebase_fe.js"
import { confirmNotificacao  } from "./alerts.js";

//logout 

document.getElementById('logout').addEventListener('click', async () => {
    if(await confirmNotificacao('Tem certeza que deseja sair?', 'Deslogar', 'Obrigado, até a proxima!', 'Obrigado por continuar com a gente!')) {
        logout();
    }
})

// check auth
async function verificarUser(){
    const uid = await checkAuthStatus();
    console.log(uid);
    if (uid) {
        db.collection('users').doc(uid).get().then((doc) => {
            if (doc.exists) {
                const user = doc.data();
                document.getElementById('user-email').innerHTML = user.email;
            }else{
                console.log('user not found');
            }
        })
    }
}
verificarUser();
//caregar email do user

