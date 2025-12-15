const db = require('../config/db');
const { logActivity } = require('./auditController');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0 || users[0].password !== password) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const user = users[0];

        // Audit log for successful login
        await logActivity(user.id, 'Login berhasil');

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,

                rt_scope: user.rt,
                rw_scope: user.rw
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
