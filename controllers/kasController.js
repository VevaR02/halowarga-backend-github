const db = require('../config/db');

const getAllKas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM finance ORDER BY date DESC, created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createKas = async (req, res) => {
    const { type, amount, description, date } = req.body;
    try {
        await db.query('INSERT INTO finance (type, amount, description, date) VALUES (?,?,?,?)', 
            [type, amount, description, date]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteKas = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM finance WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getKasChartData = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                MONTH(date) as bulan,
                SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as pengeluaran
            FROM finance
            WHERE YEAR(date) = YEAR(CURDATE()) 
            GROUP BY MONTH(date)
        `);

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

module.exports = {
    getAllKas,
    createKas,
    deleteKas,
    getKasChartData
};