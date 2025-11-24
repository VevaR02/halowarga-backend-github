const db = require('../config/db');
const { logActivity } = require('./auditController');

exports.getAllAspirasi = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM aspirations ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAspirasi = async (req, res) => {
    const { author_name, content, user_id } = req.body;
    try {
        await db.query('INSERT INTO aspirations (author_name, content, user_id, status) VALUES (?,?,?,?)', 
            [author_name, content, user_id || null, 'Pending']);
        
        if (user_id) await logActivity(user_id, `Mengirim aspirasi baru`);
        
        res.json({ success: true, message: 'Aspirasi berhasil dikirim' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAspirasi = async (req, res) => {
    const { id } = req.params;
    const { author_name, content, status, user_id } = req.body; 

    try {
        const [existing] = await db.query('SELECT * FROM aspirations WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Aspirasi tidak ditemukan' });
        }
        const oldData = existing[0];

        const finalAuthor = author_name || oldData.author_name;
        const finalContent = content || oldData.content;
        const finalStatus = status || oldData.status;

        await db.query(
            'UPDATE aspirations SET author_name = ?, content = ?, status = ? WHERE id = ?', 
            [finalAuthor, finalContent, finalStatus, id]
        );

        if (user_id) await logActivity(user_id, `Update status aspirasi ID ${id} ke ${finalStatus}`);

        res.json({ success: true, message: 'Aspirasi berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAspirasi = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    try {
        await db.query('DELETE FROM aspirations WHERE id = ?', [id]);
        
        if (user_id) await logActivity(user_id, `Menghapus aspirasi ID ${id}`);
        
        res.json({ success: true, message: 'Aspirasi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};