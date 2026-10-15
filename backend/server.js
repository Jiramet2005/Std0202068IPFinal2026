const { createApp } = require('./app');
const port = Number(process.env.PORT || 5000);
const server = createApp().listen(port, '0.0.0.0', () => console.log(`HR API listening on http://localhost:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
