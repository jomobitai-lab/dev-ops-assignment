const express = require("express");

const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Multi-Stage Build</title></head>
      <body style="font-family: sans-serif; text-align:center; padding-top:80px; background:#f6f8fa;">
        <h1 style="color:#2496ed;">Hello World from Docker multi-stage build</h1>
        <p>Running on port ${PORT} inside a small production image</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});