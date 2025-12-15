const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Server HaloWarga is Running on Port 3000');
});

app.listen(PORT, () => {
    console.log(`✅ Server Backend BERHASIL berjalan di Port ${PORT}`);
});