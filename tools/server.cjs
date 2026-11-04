const http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path');
const root = path.resolve(__dirname,'..'), port = Number(process.env.PORT || 5183);
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav'};
http.createServer(async(req,res)=>{
  try {
    const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root,'.' + (name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep) || path.relative(root,file).split(path.sep).some(p=>p.startsWith('.'))) { res.writeHead(403).end(); return; }
    res.writeHead(200,{'Content-Type':(types[path.extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-store'});
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`Walk With Me — http://localhost:${port}`));
