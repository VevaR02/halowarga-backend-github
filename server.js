const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 

app.use(express.json());

const routes = require('./routes/api');
app.use('/api', routes);

app.listen(5000, () => console.log("Server jalan di port 5000"));