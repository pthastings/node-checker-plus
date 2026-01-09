const express = require('express');
const cors = require('cors');
const path = require('path');
const statusRoutes = require('./routes/status');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', statusRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Site Status Dashboard running at http://localhost:${PORT}`);
});
