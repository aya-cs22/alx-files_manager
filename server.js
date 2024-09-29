import express from 'express';

import router from './routes/index';

const app = express();

const PORT = process.env.PORT || 5000;

// load all routes from the file routes/index.js
app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
