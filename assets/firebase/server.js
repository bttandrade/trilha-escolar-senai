import { db, auth } from './firebase_config.js';
import express from 'express';

const expressApp = express();
expressApp.use(express.json());

const validMaterias = ['Matemática', 'Português'];

// Rota para obter todos os assuntos de uma matéria
expressApp.get('/:materia/assuntos', async (req, res) => {
    try {
        const { materia } = req.params;
        if (!validMaterias.includes(materia)) {
            return res.status(400).json({ error: `Matéria inválida. Use uma das seguintes: ${validMaterias.join(', ')}.` });
        }

        // Usando db.collection no Admin SDK
        const assuntosRef = db.collection(materia);
        const assuntosSnapshot = await assuntosRef.get();
        const assuntos = assuntosSnapshot.docs.map(doc => doc.id);

        res.json(assuntos);
    } catch (error) {
        console.error("Erro ao buscar assuntos:", error);
        res.status(500).json({ error: "Erro ao buscar assuntos" });
    }
});

// Rota para obter todas as questões de um assunto específico de uma matéria
expressApp.get('/:materia/:assunto/questoes', async (req, res) => {
    try {
        const { materia, assunto } = req.params;
        if (!validMaterias.includes(materia)) {
            return res.status(400).json({ error: `Matéria inválida. Use uma das seguintes: ${validMaterias.join(', ')}.` });
        }

        // Usando db.collection para acessar subcoleções
        const questoesRef = db.collection(materia).doc(assunto).collection('Questões');
        const questoesSnapshot = await questoesRef.get();
        const questoes = questoesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(questoes);
    } catch (error) {
        console.error("Erro ao buscar questões:", error);
        res.status(500).json({ error: "Erro ao buscar questões" });
    }
});
const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
