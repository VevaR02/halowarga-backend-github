const db = require('../config/db');
const { logActivity } = require('./auditController');


exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role, full_name, rt, rw, created_at FROM users ORDER BY role ASC, created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, password, role, full_name, rt, rw, user_id } = req.body;
    try {
        const finalRT = role === 'rt' ? rt : null;
        const finalRW = (role === 'rt' || role === 'rw') ? rw : null;

        await db.query(
            'INSERT INTO users (username, password, role, full_name, rt, rw) VALUES (?,?,?,?,?,?)',
            [username, password, role, full_name, finalRT, finalRW]
        );

        // Audit log
        if (user_id) await logActivity(user_id, `Menambah user baru: ${username} (${role})`);

        res.json({ success: true, message: 'User berhasil dibuat' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Username sudah digunakan!' });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role, full_name, rt, rw, user_id } = req.body;

    try {
        const finalRT = role === 'rt' ? rt : null;
        const finalRW = (role === 'rt' || role === 'rw') ? rw : null;

        if (password) {
            await db.query(
                'UPDATE users SET username=?, password=?, role=?, full_name=?, rt=?, rw=? WHERE id=?',
                [username, password, role, full_name, finalRT, finalRW, id]
            );
        } else {
            await db.query(
                'UPDATE users SET username=?, role=?, full_name=?, rt=?, rw=? WHERE id=?',
                [username, role, full_name, finalRT, finalRW, id]
            );
        }

        // Audit log
        if (user_id) await logActivity(user_id, `Mengupdate user: ${username}`);

        res.json({ success: true, message: 'User berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        // Audit log
        if (user_id) await logActivity(user_id, `Menghapus user ID: ${id}`);

        res.json({ success: true, message: 'User dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
