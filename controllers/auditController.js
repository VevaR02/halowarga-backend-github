const db = require('../config/db');

exports.getAuditLogs = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT logs.*, users.full_name as actor_name 
            FROM audit_logs logs 
            LEFT JOIN users ON logs.user_id = users.id 
            ORDER BY logs.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logActivity = async (userId, action) => {
    try {
        if (!userId) return;
        await db.query('INSERT INTO audit_logs (user_id, action) VALUES (?, ?)', [userId, action]);
        console.log(`[LOG RECORDED] User ${userId}: ${action}`);
    } catch (err) {
        console.error("Gagal mencatat log:", err);
    }
};