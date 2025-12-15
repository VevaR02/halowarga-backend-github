const db = require('../config/db');
const { logActivity } = require('./auditController');

const getAllKas = async (req, res) => {
    try {
        const { level, rw, rt } = req.query;
        let query = 'SELECT * FROM finance';
        let conditions = [];
        let params = [];

        if (level && ['desa', 'rw', 'rt'].includes(level)) {
            conditions.push('kas_level = ?');
            params.push(level);
        }

        if (rw) {
            conditions.push('rw_number = ?');
            params.push(rw);
        }

        if (rt) {
            conditions.push('rt_number = ?');
            params.push(rt);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY date DESC, created_at DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const createKas = async (req, res) => {
    const { type, amount, description, date, kas_level, rw_number, rt_number, user_id } = req.body;
    try {
        const level = kas_level || 'desa';
        await db.query(
            'INSERT INTO finance (type, amount, description, date, kas_level, rw_number, rt_number) VALUES (?,?,?,?,?,?,?)',
            [type, amount, description, date, level, rw_number || null, rt_number || null]
        );

        // Audit log
        const typeLabel = type === 'in' ? 'Pemasukan' : 'Pengeluaran';
        if (user_id) await logActivity(user_id, `Menambah kas ${typeLabel}: Rp ${amount} - ${description}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const deleteKas = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    try {
        await db.query('DELETE FROM finance WHERE id = ?', [id]);

        // Audit log
        if (user_id) await logActivity(user_id, `Menghapus data kas ID: ${id}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getKasChartData = async (req, res) => {
    try {
        const { level, rw, rt } = req.query;
        let conditions = ['YEAR(date) = YEAR(CURDATE())'];
        let params = [];

        if (level && ['desa', 'rw', 'rt'].includes(level)) {
            conditions.push('kas_level = ?');
            params.push(level);
        }

        if (rw) {
            conditions.push('rw_number = ?');
            params.push(rw);
        }

        if (rt) {
            conditions.push('rt_number = ?');
            params.push(rt);
        }

        const whereClause = 'WHERE ' + conditions.join(' AND ');

        const [rows] = await db.query(`
            SELECT 
                MONTH(date) as bulan,
                SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as pengeluaran
            FROM finance
            ${whereClause}
            GROUP BY MONTH(date)
        `, params);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const chartData = monthNames.map((name, index) => {
            const monthIndex = index + 1;
            const found = rows.find(r => r.bulan === monthIndex);
            return {
                name: name,
                masuk: found ? Number(found.pemasukan) : 0,
                keluar: found ? Number(found.pengeluaran) : 0
            };
        });

        res.json({ success: true, data: chartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const getRWList = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT rw_number FROM finance WHERE rw_number IS NOT NULL ORDER BY rw_number');
        const rwList = rows.map(r => r.rw_number);
        res.json({ success: true, data: rwList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getRTList = async (req, res) => {
    try {
        const { rw } = req.params;
        const [rows] = await db.query(
            'SELECT DISTINCT rt_number FROM finance WHERE rw_number = ? AND rt_number IS NOT NULL ORDER BY rt_number',
            [rw]
        );
        const rtList = rows.map(r => r.rt_number);
        res.json({ success: true, data: rtList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getRWFromCitizens = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT rw FROM citizens ORDER BY rw');
        const rwList = rows.map(r => r.rw);
        res.json({ success: true, data: rwList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getRTFromCitizens = async (req, res) => {
    try {
        const { rw } = req.params;
        const [rows] = await db.query(
            'SELECT DISTINCT rt FROM citizens WHERE rw = ? ORDER BY rt',
            [rw]
        );
        const rtList = rows.map(r => r.rt);
        res.json({ success: true, data: rtList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllKas,
    createKas,
    deleteKas,
    getKasChartData,
    getRWList,
    getRTList,
    getRWFromCitizens,
    getRTFromCitizens
};