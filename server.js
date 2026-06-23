// server.js - 静态文件服务器（存在终端开发用，ESM 版本）
import http  from 'node:http';
import fs    from 'node:fs';
import path  from 'node:path';

const PORT = 8085;
const ROOT = path.dirname(new URL(import.meta.url).pathname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown; charset=utf-8',
};

function sendFile(res, filePath) {
  const ext  = path.extname(filePath);
  const ctype = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': ctype, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('403'); return; }
  sendFile(res, filePath);
});

server.listen(PORT, () => console.log(`存在终端 dev server → http://localhost:${PORT}`));
