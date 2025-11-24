const db = require('../config/db');

exports.getAllInfo = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM info_publik ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInfoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM info_publik WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Info tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createInfo = async (req, res) => {
    const { title, content, category, date, author } = req.body;
    try {
        await db.query('INSERT INTO info_publik (title, content, category, date, author) VALUES (?,?,?,?,?)', 
            [title, content, category, date, author]);
        res.json({ success: true, message: 'Info berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInfo = async (req, res) => {
    const { id } = req.params;
    const { title, content, category, date, author } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE info_publik SET title = ?, content = ?, category = ?, date = ?, author = ? WHERE id = ?', 
            [title, content, category, date, author, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Info tidak ditemukan' });
        }

        res.json({ success: true, message: 'Info berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM info_publik WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Info tidak ditemukan' });
        }

        res.json({ success: true, message: 'Info berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};