const express = require('express');
require('dotenv').config({ path: '.env.local' });
const cors = require('cors');
const bodyParser = require('body-parser');
const { PORT } = require('../config.js');
const routes = require('./routes/index.js');
const errorHandler = require('./middlewares/errorHandler.js');
const routeNotFoundHandler = require('./middlewares/routeNotFoundHandler.js');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server running' });
});
app.use('/v1', routes);

//Error handler
app.use(errorHandler);
app.use(routeNotFoundHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
