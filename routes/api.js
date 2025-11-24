const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const dashboard = require('../controllers/dashboardController');
const warga = require('../controllers/wargaController');
const kas = require('../controllers/kasController');
const info = require('../controllers/infoController');
const aspirasi = require('../controllers/aspirasiController');
const audit = require('../controllers/auditController'); 
const userCtrl = require('../controllers/userController');

router.post('/login', auth.login);
router.get('/dashboard/stats', dashboard.getStats);

router.get('/kas/chart', kas.getKasChartData);
router.get('/kas', kas.getAllKas);
router.post('/kas', kas.createKas);
router.delete('/kas/:id', kas.deleteKas);

router.get('/warga', warga.getAllCitizens);
router.post('/warga', warga.createCitizen);
router.put('/warga/:id', warga.updateCitizen);
router.delete('/warga/:id', warga.deleteCitizen);

router.get('/aspirasi', aspirasi.getAllAspirasi);
router.post('/aspirasi', aspirasi.createAspirasi);
router.put('/aspirasi/:id', aspirasi.updateAspirasi);

router.get('/info', info.getAllInfo);
router.post('/info', info.createInfo);
router.put('/info/:id', info.updateInfo);
router.delete('/info/:id', info.deleteInfo);

router.get('/audit', audit.getAuditLogs);

router.get('/users', userCtrl.getAllUsers);
router.post('/users', userCtrl.createUser);
router.put('/users/:id', userCtrl.updateUser);
router.delete('/users/:id', userCtrl.deleteUser);

module.exports = router;