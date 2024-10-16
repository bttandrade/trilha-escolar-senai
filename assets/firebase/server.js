import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import express from 'express';

const firebaseConfig = {
    apiKey: "AIzaSyCPeNzz7biYqtWg68NznozglVUKA18Y7s4",
    authDomain: "trilha-educacional-5e1cb.firebaseapp.com",
    projectId: "trilha-educacional-5e1cb",
    storageBucket: "trilha-educacional-5e1cb.appspot.com",
    messagingSenderId: "211685584933",
    appId: "1:211685584933:web:3b3410749edef661d50fcc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        const assuntosRef = collection(db, materia);
        const assuntosSnapshot = await getDocs(assuntosRef);
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
        const questoesRef = collection(db, materia, assunto, 'Questões');
        const questoesSnapshot = await getDocs(questoesRef);
        const questoes = questoesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
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

export { db };
