const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Check if we are running in production
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Hostinger usually reads the PORT environment variable or uses a default like 3000
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Error starting custom next server:", err);
  process.exit(1);
});
