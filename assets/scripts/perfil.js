import { checkAuthStatus, logout } from "../firebase/firebase_function_fe.js";
import { db } from "../firebase/firebase_fe.js"
import { confirmNotificacao  } from "./alerts.js";

document.getElementById('logout').addEventListener('click', async () => {
    if(await confirmNotificacao('Tem certeza que deseja sair?', 'Deslogar', 'Obrigado, até a proxima!', 'Obrigado por continuar com a gente!')) {
        logout();
    }
})

async function verificarUser(){
    const uid = await checkAuthStatus();
    console.log(uid);
    if (uid) {
        db.collection('users').doc(uid).get().then((doc) => {
            if (doc.exists) {
                const user = doc.data();
                document.getElementById('user-email').innerHTML = user.email;
                document.getElementById('perfil-email').innerHTML = user.email;

                document.getElementById('user-name').innerText = user.name;
                document.getElementById('user-level').innerText = user.level;

                const xpAtual = user.xpAtual;
                const xpProximoLevel = user.xpProximoLevel;

                const percent = (xpAtual / xpProximoLevel) * 100;
                document.documentElement.style.setProperty('--percent', `${percent}%`);
                document.getElementById("xp-percent").textContent = `${Math.round(percent)}%`;
            }else{
                console.log('user not found');
            }
        })
    }
}
verificarUser();
