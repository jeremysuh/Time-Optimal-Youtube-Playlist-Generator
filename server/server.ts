import express from 'express';

const app = express();
const PORT = 3001

app.get('/', (req, res) => {
    res.send('Root');
})

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}..`);
})