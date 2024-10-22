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
        const response = await fetch('http://localhost:3000/materias'); // Chama a nova rota
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const materias = await response.json();
        if (materias.length === 0) {
            Swal.fire('Aviso', 'Nenhuma matéria encontrada.', 'warning');
            hideLoading();
            return;
        }
        materias.forEach(materia => {
            const materiaDiv = document.createElement('div');
            materiaDiv.textContent = materia;
            materiaDiv.className = 'materia';
            materiaDiv.addEventListener('click', () => carregarAssuntos(materia)); // Carrega os assuntos ao clicar na matéria
            materiasContainer.appendChild(materiaDiv);
        });
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar as matérias:', error);
        Swal.fire('Erro', 'Não foi possível carregar as matérias. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

async function carregarAssuntos(materia) {
    const materiasContainer = document.getElementById('materias-container');
    materiasContainer.innerHTML = ''; // Limpa os assuntos anteriores

    try {
        showLoading();
        const response = await fetch(`http://localhost:3000/${encodeURIComponent(materia)}/assuntos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const assuntos = await response.json();
        if (assuntos.length === 0) {
            Swal.fire('Aviso', 'Nenhum assunto encontrado para esta matéria.', 'warning');
            hideLoading();
            return;
        }

        // Adiciona o botão de voltar
        const voltarButton = document.createElement('button');
        voltarButton.textContent = 'Voltar para Matérias';
        voltarButton.className = 'voltar-button';
        voltarButton.addEventListener('click', () => {
            carregarMaterias(); // Chama a função para carregar as matérias novamente
        });
        materiasContainer.appendChild(voltarButton);

        assuntos.forEach(assunto => {
            const assuntoDiv = document.createElement('div');
            assuntoDiv.textContent = assunto;
            assuntoDiv.className = 'assunto';
            assuntoDiv.addEventListener('click', () => abrirModalQuestao(materia, assunto)); // Abre o modal com a questão
            materiasContainer.appendChild(assuntoDiv);
        });
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar os assuntos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os assuntos. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

async function abrirModalQuestao(materia, assunto) {
    try {
        showLoading();
        const response = await fetch(`http://localhost:3000/${encodeURIComponent(materia)}/${encodeURIComponent(assunto)}/questoes`);
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
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar a questão:', error);
        Swal.fire('Erro', 'Não foi possível carregar a questão. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

function mostrarQuestao(questao) {
    Swal.fire({
        title: `Questão`,
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
