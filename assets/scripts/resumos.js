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
            assuntoDiv.addEventListener('click', () => abrirPdf(materia, assunto)); // Abre o PDF ao clicar no assunto
            materiasContainer.appendChild(assuntoDiv);
        });
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar os assuntos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os assuntos. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

async function abrirPdf(materia, assunto) {
    try {
        showLoading();
        const response = await fetch(`http://localhost:3000/${encodeURIComponent(materia)}/${encodeURIComponent(assunto)}/pdf`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pdfUrl = await response.json();
        window.open(pdfUrl, '_blank'); // Abre o PDF em uma nova aba
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar o PDF:', error);
        Swal.fire('Erro', 'Não foi possível carregar o PDF. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

