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
    
    const { title, content, category, event_date, author } = req.body;

    
    if (!title || !content || !event_date) {
        return res.status(400).json({ success: false, message: "Judul, Isi, dan Tanggal wajib diisi" });
    }

    try {
       
        const query = "INSERT INTO info_publik (title, content, category, event_date, author) VALUES (?, ?, ?, ?, ?)";
        
        const [result] = await db.query(query, [title, content, category, event_date, author]);

        res.status(201).json({ 
            success: true, 
            message: "Berita berhasil diposting",
            data: { id: result.insertId, ...req.body }
        });

    } catch (err) {
        console.error("Error upload berita:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.updateInfo = async (req, res) => {
    const { id } = req.params;
    // PERBAIKAN 3: Ubah 'date' jadi 'event_date' sesuai database baru
    const { title, content, category, event_date, author } = req.body; 

    try {
        const [result] = await db.query(
            'UPDATE info_publik SET title = ?, content = ?, category = ?, event_date = ?, author = ? WHERE id = ?', 
            [title, content, category, event_date, author, id]
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
