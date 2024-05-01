const express = require('express');
const os = require('os');

const app = express();
const serverHostname = os.hostname();
const appVersion = process.env.APP_VERSION;

app.get('/', (req, res) => {
  res.send(`<h1>Docker LAB5</h1>
            <p>Adres IP serwera: ${req.socket.localAddress}</p>
            <p>Nazwa serwera (hostname): ${serverHostname}</p>
            <p>Wersja aplikacji: ${appVersion}</p>`);
});

app.listen(8080, () => {
  console.log('Nasłuchuje na porcie 8080');
});