import { db, auth , bucket} from './firebase_config.js';
import express from 'express';
import cors from 'cors';

const aplicacaoExpress = express();
aplicacaoExpress.use(express.json());

// middleware CORS
aplicacaoExpress.use(cors());

const materiasValidas = ['Matemática', 'Português', 'Matemática e suas tecnologias'];

// Rota para obter todas as matérias (porquisse do caralho)
aplicacaoExpress.get('/materias', async (req, res) => {
    try {
        // Aqui você pode definir as matérias válidas diretamente
        const materias = ['Matemática', 'Português', 'Matemática e suas tecnologias'];
        res.json(materias);
    } catch (erro) {
        console.error("Erro ao buscar matérias:", erro);
        res.status(500).json({ erro: "Erro ao buscar matérias" });
    }
});

// Rota para obter todos os assuntos de uma matéria
aplicacaoExpress.get('/:materia/assuntos', async (req, res) => {
    try {
        const materia = decodeURIComponent(req.params.materia);
        console.log('Matéria recebida:', materia);
        if (!materiasValidas.includes(materia)) {
            return res.status(400).json({ erro: `Matéria inválida. Use uma das seguintes: ${materiasValidas.join(', ')}.` });
        }

        const referenciaAssuntos = db.collection(materia);
        const snapshotAssuntos = await referenciaAssuntos.get();
        const assuntos = snapshotAssuntos.docs.map(doc => doc.id);

        res.json(assuntos);
    } catch (erro) {
        console.error("Erro ao buscar assuntos:", erro);
        res.status(500).json({ erro: "Erro ao buscar assuntos" });
    }
});

// Rota para obter todas as questões de um assunto específico de uma matéria
aplicacaoExpress.get('/:materia/:assunto/questoes', async (req, res) => {
    try {
        const { materia, assunto } = req.params;
        const materiaDecodificada = decodeURIComponent(materia);
        console.log('Matéria recebida:', materiaDecodificada);
        if (!materiasValidas.includes(materiaDecodificada)) {
            return res.status(400).json({ erro: `Matéria inválida. Use uma das seguintes: ${materiasValidas.join(', ')}.` });
        }

        const referenciaQuestoes = db.collection(materiaDecodificada).doc(assunto).collection('Questões');
        const snapshotQuestoes = await referenciaQuestoes.get();
        
        if (snapshotQuestoes.empty) {
            console.log(`Nenhuma questão encontrada para ${materiaDecodificada} - ${assunto}`);
            return res.json([]);
        }

        const questoes = snapshotQuestoes.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(questoes);
    } catch (erro) {
        console.error("Erro ao buscar questões:", erro);
        res.status(500).json({ erro: "Erro ao buscar questões" });
    }
});

aplicacaoExpress.post('/:materia/:assunto/questoes', async (req, res) => {
    try {
        const materia = decodeURIComponent(req.params.materia);
        const assunto = decodeURIComponent(req.params.assunto);
        
        if (!materiasValidas.includes(materia)) {
            return res.status(400).json({ erro: `Matéria inválida. Use uma das seguintes: ${materiasValidas.join(', ')}.` });
        }
        
        const referenciaQuestoes = db.collection(materia).doc(assunto).collection('Questões');
        const questoes = Array.isArray(req.body) ? req.body : [req.body];
        
        const resultados = await Promise.all(questoes.map(questao => referenciaQuestoes.add(questao)));
        
        const idsAdicionados = resultados.map(docRef => docRef.id);
        
        res.status(201).json({ 
            mensagem: `${idsAdicionados.length} questão(ões) adicionada(s) com sucesso`,
            ids: idsAdicionados 
        });
    } catch (erro) {
        console.error("Erro ao adicionar questão(ões):", erro);
        res.status(500).json({ erro: "Erro ao adicionar questão(ões)" });
    }
});

aplicacaoExpress.get('/:materia/:assunto/pdf', async (req, res) => {
    try {
        const materia = decodeURIComponent(req.params.materia);
        const assunto = decodeURIComponent(req.params.assunto);

        // Caminho do arquivo PDF no Firebase Storage
        const filePath = `${materia}/${assunto}/resumo_matematica_enem.pdf`;  // Assumindo que o PDF tem esse nome
        const file = bucket.file(filePath);

        // Verifica se o arquivo existe no Firebase Storage
        const [exists] = await file.exists();

        if (!exists) {
            return res.status(404).json({ erro: "PDF não encontrado." });
        }

        // Configura o cabeçalho para download de PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${assunto}.pdf"`);  // Inline para exibir no navegador


        // Cria um stream de leitura e envia o PDF diretamente na resposta
        const stream = file.createReadStream();
        stream.pipe(res);

    } catch (erro) {
        console.error("Erro ao buscar o PDF:", erro);
        res.status(500).json({ erro: "Erro ao buscar o PDF" });
    }
});

const PORTA = process.env.PORT || 3000;
aplicacaoExpress.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});
