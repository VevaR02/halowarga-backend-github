const db = require('../config/db');
const { logActivity } = require('./auditController');

exports.getAllCitizens = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM citizens ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCitizen = async (req, res) => {
    const { nik, nama, jenis_kelamin, status_hunian, no_hp, 
            input_rt, input_rw, 
            scope_role, scope_rt, scope_rw,
            user_id
          } = req.body;
    
    try {
        let finalRT = input_rt;
        let finalRW = input_rw || '05';

        if (scope_role === 'rt') {
            finalRT = scope_rt; 
            finalRW = scope_rw;
        } 
        else if (scope_role === 'rw') {
            finalRW = scope_rw; 
        }

        await db.query(
            'INSERT INTO citizens (nik, nama, jenis_kelamin, rt, rw, status_hunian, no_hp) VALUES (?,?,?,?,?,?,?)', 
            [nik, nama, jenis_kelamin, finalRT, finalRW, status_hunian, no_hp]
        );
     
        if (user_id) await logActivity(user_id, `Menambah warga baru: ${nama} (${nik})`);

        res.json({ success: true, message: 'Data warga berhasil ditambahkan' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'NIK sudah terdaftar!' });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCitizen = async (req, res) => {
    const { id } = req.params;
    const { nik, nama, jenis_kelamin, rt, rw, status_hunian, no_hp, 
            scope_role, scope_rt, scope_rw, user_id } = req.body;
    
    try {
        const [targets] = await db.query('SELECT rt, rw FROM citizens WHERE id = ?', [id]);
        if (targets.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        
        const target = targets[0];

        if (scope_role === 'rt') {
            if (Number(target.rt) !== Number(scope_rt) || Number(target.rw) !== Number(scope_rw)) {
                return res.status(403).json({ success: false, message: 'AKSES DITOLAK: Wilayah tidak cocok.' });
            }
        } else if (scope_role === 'rw') {
            if (Number(target.rw) !== Number(scope_rw)) {
                return res.status(403).json({ success: false, message: 'AKSES DITOLAK: Wilayah tidak cocok.' });
            }
        }

        await db.query(
            'UPDATE citizens SET nik = ?, nama = ?, jenis_kelamin = ?, rt = ?, rw = ?, status_hunian = ?, no_hp = ? WHERE id = ?', 
            [nik, nama, jenis_kelamin, rt, rw, status_hunian, no_hp, id]
        );
        if (user_id) await logActivity(user_id, `Mengupdate data warga: ${nama}`);
        res.json({ success: true, message: 'Berhasil diperbarui' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCitizen = async (req, res) => {
    const { id } = req.params;
    const { scope_role, scope_rt, scope_rw, user_id } = req.query; 

    try {
        const [targets] = await db.query('SELECT rt, rw FROM citizens WHERE id = ?', [id]);
        if (targets.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        
        const target = targets[0];

        if (scope_role === 'rt') {
            if (Number(target.rt) !== Number(scope_rt) || Number(target.rw) !== Number(scope_rw)) {
                return res.status(403).json({ success: false, message: 'AKSES DITOLAK: Wilayah tidak cocok.' });
            }
        } else if (scope_role === 'rw') {
            if (Number(target.rw) !== Number(scope_rw)) {
                return res.status(403).json({ success: false, message: 'AKSES DITOLAK: Wilayah tidak cocok.' });
            }
        }

        await db.query('DELETE FROM citizens WHERE id = ?', [id]);
        if (user_id) await logActivity(user_id, `Menghapus data warga ID: ${id}`);
        res.json({ success: true, message: 'Data warga berhasil dihapus' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};