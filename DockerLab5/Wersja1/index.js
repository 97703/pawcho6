const fs = require('fs');
const os = require('os');
const ip = require('ip');

const serverIp = ip.address();
const serverHostname = os.hostname();
const appVersion = process.env.APP_VERSION;

const htmlContent = `
  <!DOCTYPE html>
  <html lang="pl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker LAB5</title>
  </head>
  <body>
    <h1>Docker LAB5</h1>
    <p>Adres IP: ${serverIp}</p>
    <p>Hostname: ${serverHostname}</p>
    <p>Wersja aplikacji: ${appVersion}</p>
  </body>
  </html>
`;

fs.writeFileSync('index.html', htmlContent);
