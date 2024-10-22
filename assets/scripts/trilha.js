import { db, auth} from '../firebase/firebase_fe.js';
import { checkAuthStatus, logout } from "../firebase/firebase_function_fe.js";
import { confirmNotificacao  } from "./alerts.js";

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    
    if (subject) {
        document.getElementById('subject-title').textContent = decodeURIComponent(subject);
        criarTrilha(subject);
    }
});
// Carregamento
function showLoading() {
    document.getElementById('loadingModal').style.display = 'flex';
  }

  // Ocultar o modal de loading
  function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
  }

async function criarTrilha(subject) {
    const trilhaContainer = document.getElementById('trilha-container');
    trilhaContainer.innerHTML = '';

    try {
        // Fetch subjects from Firestore
        showLoading();
        const subjectsSnapshot = await db.collection(subject).get();
        const assuntos = subjectsSnapshot.docs.map(doc => doc.id);

        const user = auth.currentUser;
        let userProgress = {};
        
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            userProgress = userData.trilhas && userData.trilhas[subject] ? userData.trilhas[subject] : {};
        }

        assuntos.forEach((assunto, index) => {
            const quadrado = document.createElement('div');
            quadrado.className = 'quadrado';
            quadrado.addEventListener('click', () => abrirModalAssunto(assunto, subject));
            trilhaContainer.appendChild(quadrado);

            const esferasContainer = document.createElement('div');
            esferasContainer.className = 'esferas-container';
            trilhaContainer.appendChild(esferasContainer);

            const nivelAtual = userProgress[assunto] || 0;
            quadrado.innerHTML = `${assunto}<br>Nível: ${nivelAtual}`;

            for (let i = 1; i <= 5; i++) {
                const esfera = document.createElement('div');
                esfera.className = 'esfera';
                esfera.textContent = i;
                esfera.dataset.assunto = assunto;
                esfera.dataset.nivel = i;

                if (i <= nivelAtual) {
                    esfera.classList.add('respondida');
                    esfera.textContent = '';
                } else if (i === nivelAtual + 1) {
                    esfera.classList.add('desbloqueada');
                } else {
                    esfera.classList.add('bloqueada');
                }

                esfera.addEventListener('click', (event) => iniciarQuestao(event, subject, assunto, i));
                esferasContainer.appendChild(esfera);
            }
        });

        const trofeu = document.createElement('div');
        trofeu.className = 'quadrado trofeu bloqueado';
        trofeu.innerHTML = '<i class="fa-solid fa-award"></i>';
        trofeu.addEventListener('click', mostrarMensagemFinal);
        trilhaContainer.appendChild(trofeu);
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar os assuntos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os assuntos. Por favor, tente novamente.', 'error');
    }
}

async function abrirModalAssunto(assunto, subject) {
    const user = auth.currentUser;

    // Log para verificar se o usuário está autenticado
    console.log("Usuário autenticado:", user);
    console.log(assunto, subject);
    if (user) {
        try {
            showLoading();
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            const nivelAtual = userData.trilhas && userData.trilhas[subject] && userData.trilhas[subject][assunto] ? userData.trilhas[subject][assunto] : 0;
            console.log(`Nível atual do usuário em ${subject} - ${assunto}: ${nivelAtual}`);

            // Exibir o PDF no Swal
            Swal.fire({
                title: `Assunto: ${assunto}`,
                text: `Este é o módulo de ${assunto}. Você está pronto para começar?`,
                showCancelButton: true,
                confirmButtonText: 'Começar',
                cancelButtonText: 'Fechar',
                html: `
                    <div class="pdf-modal">
                        <iframe src="http://localhost:3000/${subject}/${assunto}/pdf#toolbar=0&navpanes=0&scrollbar=0" id="pdfIframe"></iframe>
                    </div>
                `,
                customClass: {
                    container: 'pdf-swal-container'
                },
                width: '60%',
                heightAuto: false,
                didOpen: () => {
                    // Adicionar CSS personalizado ao modal
                    
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .pdf-modal {
                            position: relative;
                            padding: 0; /* Remover padding */
                            width: 100%;
                            height: 80vh; /* Ajustar altura */
                            overflow: hidden; /* Ocultar o overflow */
                        }
                        #pdfIframe {
                            width: 100%; /* Ajustar largura para 100% */
                            height: 100%;
                            border: none; /* Remover borda do iframe */
                            margin: 0; /* Remover margens */
                            padding: 0; /* Remover padding */
                        }
                        .pdf-swal-container {
                            padding: 0; /* Remover padding do container */
                            border: none; /* Remover borda do SweetAlert */
                        }
                    `;
                    document.head.appendChild(style);
                    hideLoading();
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    desbloquearAssunto(assunto);
                }
            });

        } catch (error) {
            console.error("Erro ao buscar nível do usuário:", error);
            Swal.fire({
                title: 'Erro!',
                text: 'Ocorreu um erro ao buscar os dados do usuário.',
                icon: 'error'
            });
        }
    } else {
        console.log("Usuário não está logado");
        Swal.fire({
            title: 'Acesso Negado',
            text: 'Você precisa estar logado para acessar este módulo.',
            icon: 'warning'
        });
    }
}



function desbloquearAssunto(assunto) {
    const esferas = document.querySelectorAll(`.esfera[data-assunto="${assunto}"]`);
    esferas.forEach((esfera, index) => {
        if (index === 0) {
            esfera.classList.remove('bloqueada');
            esfera.classList.add('desbloqueada');
        }
    });
}

async function abrirModal(event, subject) {
    const assunto = event.target.dataset.assunto;
    const numeroEsfera = parseInt(event.target.textContent);

    if (event.target.classList.contains('bloqueada')) {
        Swal.fire('Bloqueado', 'Esta esfera ainda está bloqueada. Complete os níveis anteriores primeiro.', 'warning');
        return;
    }

    if (event.target.classList.contains('respondida')) {
        Swal.fire({
            title: 'Questão Respondida',
            text: 'Você já completou esse nível!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/${encodeURIComponent(subject)}/${encodeURIComponent(assunto)}/questoes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const questoes = await response.json();

        if (questoes.length > 0) {
            const questaoAleatoria = questoes[Math.floor(Math.random() * questoes.length)];
            mostrarQuestao(questaoAleatoria, numeroEsfera, event.target);
        } else {
            Swal.fire('Erro', 'Não há questões disponíveis para este assunto.', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar a questão:', error);
        Swal.fire('Erro', 'Não foi possível carregar a questão. Por favor, tente novamente.', 'error');
    }
}

function mostrarQuestao(questao, numeroEsfera, esfera) {
    Swal.fire({
        title: `Questão ${numeroEsfera}`,
        html: `
            <p>${questao.texto}</p>
            <form id="quizForm">
                ${questao.alternativas.map((opcao, index) => `
                    <div>
                        <input type="radio" id="opcao${index}" name="resposta" value="${opcao}">
                        <label for="opcao${index}">${opcao}</label>
                    </div>
                `).join('')}
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Resposta',
        cancelButtonText: 'Fechar',
        preConfirm: () => {
            const respostaSelecionada = document.querySelector('input[name="resposta"]:checked');
            if (!respostaSelecionada) {
                Swal.showValidationMessage('Por favor, selecione uma resposta');
                return false;
            }
            return respostaSelecionada.value;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            verificarResposta(questao.resposta, result.value, numeroEsfera, esfera);
        }
    });
}

async function verificarResposta(respostaCorreta, respostaSelecionada, nivel, esfera) {
    const resultado = respostaSelecionada === respostaCorreta ? 'Resposta correta!' : 'Resposta incorreta.';
    
    const user = auth.currentUser;
    if (user && respostaSelecionada === respostaCorreta) {
        try {
            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            const subject = document.getElementById('subject-title').textContent;
            const assunto = esfera.dataset.assunto;
            
            if (!userData.trilhas) {
                userData.trilhas = {};
            }
            if (!userData.trilhas[subject]) {
                userData.trilhas[subject] = {};
            }
            
            const nivelAtual = userData.trilhas[subject][assunto] || 0;
            if (nivel > nivelAtual) {
                await userRef.update({
                    [`trilhas.${subject}.${assunto}`]: nivel
                });
                console.log(`Progresso atualizado para ${subject} - ${assunto}: ${nivel}`);
                
                // Atualiza o nível exibido no quadrado
                const quadrado = document.querySelector(`.quadrado:contains('${assunto}')`);
                if (quadrado) {
                    quadrado.innerHTML = `${assunto}<br>Nível: ${nivel}`;
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar progresso da trilha:", error);
        }
    }
    
    Swal.fire({
        title: resultado,
        text: respostaSelecionada === respostaCorreta ? 'Parabéns! Você completou este nível.' : 'Tente novamente!',
        icon: respostaSelecionada === respostaCorreta ? 'success' : 'error',
        confirmButtonText: 'OK'
    }).then(() => {
        if (respostaSelecionada === respostaCorreta) {
            marcarEsferaRespondida(esfera);
            desbloquearProximaEsfera(nivel, esfera.dataset.assunto);
        }
    });
}

function marcarEsferaRespondida(esfera) {
    esfera.classList.remove('desbloqueada');
    esfera.classList.add('respondida');
    esfera.textContent = ''; // Remove o número
}

function desbloquearProximaEsfera(nivel, assunto) {
    const esferas = document.querySelectorAll(`.esfera[data-assunto="${assunto}"]`);
    const esferaAtual = document.querySelector(`.esfera[data-nivel="${nivel}"]`);
    const indexAtual = Array.from(esferas).indexOf(esferaAtual);
    
    if (indexAtual < esferas.length - 1) {
        const proximaEsfera = esferas[indexAtual + 1];
        proximaEsfera.classList.remove('bloqueada');
        proximaEsfera.classList.add('desbloqueada');
    } else {
        const todasEsferas = document.querySelectorAll('.esfera');
        const todasRespondidas = Array.from(todasEsferas).every(esfera => 
            esfera.classList.contains('respondida') || esfera.classList.contains('desbloqueada')
        );
        
        if (todasRespondidas) {
            const trofeu = document.querySelector('.trofeu');
            trofeu.classList.remove('bloqueado');
            trofeu.classList.add('desbloqueado');
        }
    }
}

function mostrarMensagemFinal() {
    if (this.classList.contains('desbloqueado')) {
        Swal.fire({
            title: 'Parabéns!',
            text: 'Você completou todos os módulos da Trilha Educacional!',
            icon: 'success',
            confirmButtonText: 'Fechar'
        });
    } else {
        Swal.fire({
            title: 'Bloqueado',
            text: 'Complete todos os módulos para desbloquear o troféu!',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
    }
}

async function iniciarQuestao(event, subject, assunto, numeroEsfera) {
    const esfera = event.target;
    
    if (esfera.classList.contains('bloqueada')) {
        Swal.fire('Bloqueado', 'Complete os níveis anteriores primeiro.', 'warning');
        return;
    }

    if (esfera.classList.contains('respondida')) {
        Swal.fire('Nível Completo', 'Você já completou este nível!', 'info');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/${encodeURIComponent(subject)}/${encodeURIComponent(assunto)}/questoes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const questoes = await response.json();

        if (questoes.length > 0) {
            const questaoAleatoria = questoes[Math.floor(Math.random() * questoes.length)];
            mostrarQuestao(questaoAleatoria, numeroEsfera, esfera);
        } else {
            Swal.fire('Erro', 'Não há questões disponíveis para este assunto.', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar a questão:', error);
        Swal.fire('Erro', 'Não foi possível carregar a questão. Por favor, tente novamente.', 'error');
    }
}


//Firebase

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