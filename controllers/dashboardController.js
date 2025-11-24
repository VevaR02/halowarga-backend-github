const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const { rw } = req.query;

        const [warga] = await db.query('SELECT COUNT(*) as total FROM citizens');
        const [kas] = await db.query(`
            SELECT COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as saldo 
            FROM finance`
        );
        const [aspirasi] = await db.query("SELECT COUNT(*) as total FROM aspirations WHERE status = 'Pending'");

        let chartQuery;
        let queryParams = [];

        if (rw && rw !== 'All') {
           
            chartQuery = `
                SELECT rt as label, CAST(COUNT(*) AS UNSIGNED) as value 
                FROM citizens 
                WHERE rw = ? 
                GROUP BY rt 
                ORDER BY rt ASC
            `;
            queryParams = [rw];
        } else {
            
            chartQuery = `
                SELECT rw as label, CAST(COUNT(*) AS UNSIGNED) as value 
                FROM citizens 
                GROUP BY rw 
                ORDER BY rw ASC
            `;
        }

        const [chartData] = await db.query(chartQuery, queryParams);
        const [listRW] = await db.query('SELECT DISTINCT rw FROM citizens ORDER BY rw ASC');

        res.json({
            success: true,
            stats: {
                total_warga: warga[0].total,
                saldo_kas: Number(kas[0].saldo),
                aspirasi_pending: aspirasi[0].total
            },
            chart: chartData,
            rw_list: listRW.map(item => item.rw)
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ error: err.message });
    }
};