document.addEventListener('DOMContentLoaded', async () => {
    await carregarMaterias();
});

function showLoading() {
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}

async function carregarMaterias() {
    const materiasContainer = document.getElementById('materias-container');
    materiasContainer.innerHTML = '';

    try {
        showLoading();
        const response = await fetch('/materias');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const materias = await response.json();
        if (materias.length === 0) {
            Swal.fire('Aviso', 'Nenhuma matéria encontrada.', 'warning');
            hideLoading();
            return;
        }

        for (const materia of materias) {
            const materiaDiv = document.createElement('div');
            materiaDiv.textContent = materia;
            materiaDiv.className = 'materia';
            materiasContainer.appendChild(materiaDiv);

            const assuntosContainer = document.createElement('div');
            assuntosContainer.className = 'assuntos-container';
            materiasContainer.appendChild(assuntosContainer);

            // Carrega os assuntos da matéria
            await carregarAssuntos(materia, assuntosContainer);
        }

    } catch (error) {
        console.error('Erro ao carregar as matérias:', error);
        Swal.fire('Erro', 'Não foi possível carregar as matérias. Por favor, tente novamente.', 'error');
    } finally {
        hideLoading();
    }
}

async function carregarAssuntos(materia, assuntosContainer) {
    try {
        showLoading();
        const response = await fetch(`/${encodeURIComponent(materia)}/assuntos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const assuntos = await response.json();
        
        // if (assuntos.length === 0) {
        //     Swal.fire('Aviso', 'Nenhum assunto encontrado para esta matéria.', 'warning');
        //     return;
        // }

        assuntos.forEach(assunto => {
            const assuntoDiv = document.createElement('div');
            assuntoDiv.textContent = assunto;
            assuntoDiv.className = 'assunto';
            assuntoDiv.addEventListener('click', () => abrirModalQuestao(materia, assunto));
            assuntosContainer.appendChild(assuntoDiv);
        });

    } catch (error) {
        console.error('Erro ao carregar os assuntos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os assuntos. Por favor, tente novamente.', 'error');
    } finally {
        hideLoading();
    }
}

async function abrirModalQuestao(materia, assunto) {
    try {
        showLoading();
        const response = await fetch(`/${encodeURIComponent(materia)}/${encodeURIComponent(assunto)}/questoes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const questoes = await response.json();
        if (questoes.length > 0) {
            const questaoAleatoria = questoes[Math.floor(Math.random() * questoes.length)];
            mostrarQuestao(questaoAleatoria);
        } else {
            Swal.fire('Erro', 'Não há questões disponíveis para este assunto.', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar a questão:', error);
        Swal.fire('Erro', 'Não foi possível carregar a questão. Por favor, tente novamente.', 'error');
    } finally {
        hideLoading();
    }
}

function mostrarQuestao(questao) {
    Swal.fire({
        title: `Questão`,
        html: `
            <p>${questao.texto}</p>
            <form id="quizForm" class="opcoes-container">
                ${questao.alternativas.map((opcao, index) => `
                    <div class="opcao-item">
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
        },
        customClass: {
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            verificarResposta(questao.resposta, result.value);
        }
    });
}

function verificarResposta(respostaCorreta, respostaSelecionada) {
    const resultado = respostaSelecionada === respostaCorreta ? 'Resposta correta!' : 'Resposta incorreta.';
    Swal.fire({
        title: resultado,
        text: respostaSelecionada === respostaCorreta ? 'Parabéns! Você acertou.' : 'Tente novamente!',
        icon: respostaSelecionada === respostaCorreta ? 'success' : 'error',
        confirmButtonText: 'OK'
    });
}
