const caminho = document.getElementById('caminho');
const modal = new bootstrap.Modal(document.getElementById('modal'));
const modalTexto = document.getElementById('modal-texto');

let nivelAtual = 1;
let questoes;
let assuntosDesbloqueados = {};

// Função para obter o parâmetro da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para criar a trilha
async function criarTrilha() {
    try {
        const response = await fetch('../jsons/questoes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Obter o assunto da URL
        const subject = getUrlParameter('subject');
        
        // Verificar se o assunto existe no JSON
        if (data[subject]) {
            questoes = data[subject][0];
        } else {
            throw new Error('Assunto não encontrado no JSON');
        }

        let nivelGlobal = 1;

        // Adicionar a linha
        const linha = document.createElement('div');
        linha.className = 'linha';
        caminho.appendChild(linha);

        for (const [assunto, questoesAssunto] of Object.entries(questoes)) {
            // Criar quadrado para o assunto
            const quadrado = document.createElement('div');
            quadrado.className = 'quadrado desbloqueado';
            quadrado.textContent = assunto;
            quadrado.dataset.assunto = assunto;
            quadrado.addEventListener('click', () => abrirModalAssunto(assunto));
            caminho.appendChild(quadrado);

            assuntosDesbloqueados[assunto] = false;

            // Criar esferas para as questões do assunto
            questoesAssunto.forEach((questao, index) => {
                const esfera = document.createElement('div');
                esfera.className = 'esfera bloqueada';
                esfera.textContent = nivelGlobal;
                esfera.dataset.assunto = assunto;
                esfera.dataset.indice = index;
                esfera.dataset.nivel = nivelGlobal;
                esfera.addEventListener('click', abrirModal);
                caminho.appendChild(esfera);
                nivelGlobal++;
            });
        }

        // Adicionar o troféu ao final do caminho
        const trofeu = document.createElement('div');
        trofeu.className = 'quadrado trofeu bloqueado';
        trofeu.innerHTML = '<i class="fa-solid fa-award"></i>';
        trofeu.addEventListener('click', mostrarMensagemFinal);
        caminho.appendChild(trofeu);

    } catch (error) {
        console.error('Erro ao carregar as questões:', error);
    }
}

function abrirModalAssunto(assunto) {
    if (!assuntosDesbloqueados[assunto]) {
        modalTexto.innerHTML = `
            <h3>Assunto: ${assunto}</h3>
            <p>Este é o módulo de ${assunto}. Você está pronto para começar?</p>
            <button class="btn btn-primary" onclick="desbloquearAssunto('${assunto}')">Começar</button>
            <button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        `;
    } else {
        modalTexto.innerHTML = `
            <h3>Assunto: ${assunto}</h3>
            <p>Este é o módulo de ${assunto}. Clique nas esferas para responder às questões.</p>
            <button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        `;
    }
    modal.show();
}

function desbloquearAssunto(assunto) {
    assuntosDesbloqueados[assunto] = true;
    const esferas = document.querySelectorAll(`.esfera[data-assunto="${assunto}"]`);
    esferas.forEach((esfera, index) => {
        if (index === 0) {
            esfera.classList.remove('bloqueada');
            esfera.classList.add('desbloqueada');
            nivelAtual = parseInt(esfera.dataset.nivel);
        }
    });
    modal.hide();
}

function abrirModal(event) {
    const assunto = event.target.dataset.assunto;
    const indice = parseInt(event.target.dataset.indice);
    const numeroEsfera = parseInt(event.target.textContent);

    if (!assuntosDesbloqueados[assunto] || event.target.classList.contains('bloqueada')) {
        alert('Esta esfera ainda está bloqueada. Complete os níveis anteriores primeiro.');
        return;
    }

    event.target.classList.remove('bloqueada');

    const questao = questoes[assunto][indice];
    
    modalTexto.innerHTML = `
        <h3>Questão ${numeroEsfera}: ${questao.pergunta}</h3>
        <form id="quizForm">
            ${questao.opcoes.map((opcao, index) => `
                <div>
                    <input type="radio" id="opcao${index}" name="resposta" value="${opcao}">
                    <label for="opcao${index}">${opcao}</label>
                </div>
            `).join('')}
            <button type="submit" class="btn btn-primary" id="confirmarResposta">Confirmar Resposta</button>
        </form>
    `;
    modal.show();

    document.getElementById('quizForm').addEventListener('submit', (e) => {
        e.preventDefault();
        verificarResposta(questao.resposta, numeroEsfera, event.target);
    });
}

// Scroll to the bottom of the page
window.onload = criarTrilha;

function verificarResposta(respostaCorreta, nivel, esfera) {
    const respostaSelecionada = document.querySelector('input[name="resposta"]:checked');
    if (!respostaSelecionada) {
        alert('Por favor, selecione uma resposta.');
        return;
    }

    const opcoes = document.querySelectorAll('input[name="resposta"]');
    opcoes.forEach(opcao => {
        opcao.disabled = true;
        const label = opcao.nextElementSibling;
        if (opcao.value === respostaCorreta) {
            label.style.color = 'green';
        } else if (opcao === respostaSelecionada) {
            label.style.color = 'red';
        }
    });

    const resultado = respostaSelecionada.value === respostaCorreta ? 'Resposta correta!' : 'Resposta incorreta.';
    modalTexto.innerHTML += `<p>${resultado}</p>`;

    document.getElementById('confirmarResposta').disabled = true;

    if (respostaSelecionada.value === respostaCorreta) {
        desbloquearProximaEsfera(nivel, esfera.dataset.assunto);
        modalTexto.innerHTML += `<p>Parabéns! Você desbloqueou o próximo nível.</p>`;
    }

    // Remove the setTimeout here
    // Add a close button instead
    modalTexto.innerHTML += `<button class="btn btn-secondary mt-3" onclick="fecharModal()">Fechar</button>`;
}

function desbloquearProximaEsfera(nivel, assunto) {
    const esferas = document.querySelectorAll(`.esfera[data-assunto="${assunto}"]`);
    const esferaAtual = document.querySelector(`.esfera[data-nivel="${nivel}"]`);
    const indexAtual = Array.from(esferas).indexOf(esferaAtual);
    
    if (indexAtual < esferas.length - 1) {
        const proximaEsfera = esferas[indexAtual + 1];
        proximaEsfera.classList.remove('bloqueada');
        proximaEsfera.classList.add('desbloqueada');
        nivelAtual = parseInt(proximaEsfera.dataset.nivel);
    } else {
        // Verificar se todas as esferas foram desbloqueadas
        const todasEsferas = document.querySelectorAll('.esfera');
        const todasDesbloqueadas = Array.from(todasEsferas).every(esfera => esfera.classList.contains('desbloqueada'));
        
        if (todasDesbloqueadas) {
            const trofeu = document.querySelector('.trofeu');
            trofeu.classList.remove('bloqueado');
            trofeu.classList.add('desbloqueado');
        }
    }
}

// Adicione esta função para fechar o modal
function fecharModal() {
    modal.hide();
}

function mostrarMensagemFinal() {
    if (this.classList.contains('desbloqueado')) {
        modalTexto.innerHTML = `
            <h3>Parabéns!</h3>
            <p>Você completou todos os módulos da Trilha Educacional de Matemática!</p>
            <p>Continue explorando e aprendendo mais!</p>
            <button class="btn btn-primary" data-bs-dismiss="modal">Fechar</button>
        `;
        modal.show();
    } else {
        alert('Complete todos os módulos para desbloquear o troféu!');
    }
}
