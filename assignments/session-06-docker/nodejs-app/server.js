// Simple Node.js (Express) web server that shows Hello World
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Node.js App</title></head>
      <body style="font-family: sans-serif; text-align:center; padding-top:80px; background:#f6f8fa;">
        <h1 style="color:#3c873a;">Hello World from Node.js 🚀</h1>
        <p>Running inside a Docker container on port ${PORT}</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Node app running on port ${PORT}`));
