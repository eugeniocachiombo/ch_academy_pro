import { Router } from 'express';
import { gradeSubjectRepository } from '../repository/grade_subject.repository.js';
import cryptoService from '../services/crypto.service.js';

const router = Router();


router.get('/grade-subjects', async (req, res) => {
    try {
        const data = await gradeSubjectRepository.listAllGrouped();
        res.json(data);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Erro ao listar disciplinas por classe.' });
    }
});


router.post('/grade-subjects', async (req, res) => {
    try {
        const { encryptedGradeId, gradeId, subjectIds } = req.body;
        
        let resolvedGradeId = gradeId;
        if (encryptedGradeId) {
            resolvedGradeId = Number(cryptoService.decryptId(encryptedGradeId));
        }

        const result = await gradeSubjectRepository.saveGradeSubjects({
            gradeId: Number(resolvedGradeId),
            subjectIds
        });
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Erro ao associar disciplinas à classe.' });
    }
});


router.delete('/grade-subjects/:encryptedId', async (req, res) => {
    try {
        const gradeId = Number(cryptoService.decryptId(req.params.encryptedId));
        await gradeSubjectRepository.remove(gradeId);
        res.json({ message: 'Associações removidas com sucesso.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Erro ao remover associações.' });
    }
});

export const gradeSubjectRoutes = router;