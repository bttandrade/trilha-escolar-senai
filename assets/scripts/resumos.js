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
        const response = await fetch('/materias'); // Chama a nova rota
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

            // Carrega os assuntos da matéria abaixo dela
            const assuntosContainer = document.createElement('div');
            assuntosContainer.className = 'assuntos-container';
            materiasContainer.appendChild(assuntosContainer);

            await carregarAssuntos(materia, assuntosContainer);
        }

        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar as matérias:', error);
        Swal.fire('Erro', 'Não foi possível carregar as matérias. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

async function carregarAssuntos(materia, assuntosContainer) {
    try {
        showLoading();
        const response = await fetch(`${encodeURIComponent(materia)}/assuntos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const assuntos = await response.json();
        if (assuntos.length === 0) {
            Swal.fire('Aviso', 'Nenhum assunto encontrado para esta matéria.', 'warning');
            hideLoading();
            return;
        }

        assuntos.forEach(assunto => {
            const assuntoDiv = document.createElement('div');
            assuntoDiv.textContent = assunto;
            assuntoDiv.className = 'assunto';
            assuntoDiv.addEventListener('click', () => abrirPdf(materia, assunto)); // Abre o PDF ao clicar no assunto
            assuntosContainer.appendChild(assuntoDiv);
        });

        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar os assuntos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os assuntos. Por favor, tente novamente.', 'error');
        hideLoading();
    }
}

// Função para abrir o PDF
async function abrirPdf(materia, assunto) {
    try {
        showLoading();
        console.log('Assunto recebido:', assunto);
        console.log('Matéria recebida:', materia);

        // Monta a URL para acessar o PDF
        const pdfUrl = `/${materia}/${assunto}/pdf`;

        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Abre o PDF em uma nova aba
        window.open(pdfUrl, '_blank');

    } catch (error) {
        console.error('Erro ao carregar o PDF:', error);
        Swal.fire('Erro', 'Não foi possível carregar o PDF. Por favor, tente novamente.', 'error');
    } finally {
        hideLoading();
    }
}
