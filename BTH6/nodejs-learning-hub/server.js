const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const AppEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

const appEmitter = new AppEmitter();
const PORT = 3000;

function serveFile(res, filePath, contentType = 'text/html') {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const route = parsedUrl.pathname;
    const method = req.method;

    // --- MAIN PAGES (VIEWS) ---
    if (route === '/' && method === 'GET') {
        serveFile(res, 'views/index.html');
    }
    else if (route === '/events' && method === 'GET') {
        serveFile(res, 'views/events.html');
    }
    else if (route === '/request' && method === 'GET') {
        const fullPath = path.join(__dirname, 'views/request.html');
        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Internal Server Error');
            }
            
            let view = data;
            view = view.replace('{{REQ_URL}}', req.url);
            view = view.replace('{{REQ_METHOD}}', req.method);
            view = view.replace('{{REQ_QUERY}}', JSON.stringify(parsedUrl.query, null, 2));
            view = view.replace('{{REQ_HEADERS}}', JSON.stringify(req.headers, null, 2));
            
            // Thiết lập Response Header theo yêu cầu
            res.setHeader('X-Student-Name', 'NodeJS Learner');
            res.setHeader('X-Powered-By', 'Native NodeJS HTTP');
            
            const resHeadersObj = {
                'X-Student-Name': res.getHeader('X-Student-Name'),
                'X-Powered-By': res.getHeader('X-Powered-By'),
                'Content-Type': 'text/html'
            };
            view = view.replace('{{RES_HEADERS}}', JSON.stringify(resHeadersObj, null, 2));
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(view);
        });
    }
    else if (route === '/streams' && method === 'GET') {
        serveFile(res, 'views/streams.html');
    }

    // --- ENDPOINTS ---
    else if (route === '/json' && method === 'GET') {
        const dataJson = {
            success: true,
            title: "BTH6 NodeJS JSON Response",
            timestamp: new Date().toISOString()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dataJson));
    }
    else if (route === '/image' && method === 'GET') {
        const imgPath = path.join(__dirname, 'public/images/sample.png');
        if (fs.existsSync(imgPath)) {
            const readStream = fs.createReadStream(imgPath);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            readStream.pipe(res); // Stream ảnh về client
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found');
        }
    }
    else if (route === '/event' && method === 'POST') {
        // Trigger EventEmitter
        appEmitter.triggerActivity('User Requested Event Trigger', (counterMsg) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'Success', 
                message: 'Event was successfully fired and logged internally.',
                details: counterMsg
            }));
        });
    }
    else if (route === '/download-log' && method === 'GET') {
        const logPath = path.join(__dirname, 'data/log.txt');
        if (fs.existsSync(logPath)) {
            // Thiết lập header cho tải file
            res.setHeader('Content-disposition', 'attachment; filename=server_log.txt');
            res.setHeader('Content-type', 'text/plain');
            const fileStream = fs.createReadStream(logPath);
            fileStream.pipe(res); // Đọc file log bằng stream và trả
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Log file missing.');
        }
    }

    // --- STREAM ACTIONS FROM FORMS ---
    else if (route === '/streams/readable' && method === 'GET') {
        const storyPath = path.join(__dirname, 'data/story.txt');
        if (fs.existsSync(storyPath)) {
            const readStream = fs.createReadStream(storyPath);
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            readStream.pipe(res);
        } else {
            res.end('Story file missing.');
        }
    }
    else if (route === '/streams/writable' && method === 'POST') {
        const body = await parseBody(req);
        // Vì data từ HTML form gửi lên dạng application/x-www-form-urlencoded
        const params = new URLSearchParams(body);
        const textToLog = params.get('logText');
        
        const logPath = path.join(__dirname, 'data/log.txt');
        const writeStream = fs.createWriteStream(logPath, { flags: 'a' });
        
        writeStream.write(`\n[LOG EVENT] Data from writable stream: ${textToLog}`);
        writeStream.end(() => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<body style="font-family:sans-serif; background:#e8f4f8; padding:10px;">
                        Ghi log thành công: <strong>${textToLog}</strong>
                     </body>`);
        });
    }
    else if (route === '/streams/transform' && method === 'POST') {
        const body = await parseBody(req);
        const params = new URLSearchParams(body);
        const text = params.get('transformText') || '';
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write('<body style="font-family:sans-serif; background:#e8f4f8; padding:10px;">Transform Result (IN HOA & DACH_DUOI): <br><br>');
        
        const transformStream = new TextTransform();
        transformStream.on('data', chunk => {
            res.write(`<strong style="color:red; font-size:18px;">${chunk.toString()}</strong>`);
        });
        transformStream.on('end', () => {
            res.write('</body>');
            res.end();
        });
        
        transformStream.write(Buffer.from(text));
        transformStream.end();
    }
    else if (route === '/streams/duplex' && method === 'POST') {
        const body = await parseBody(req);
        const params = new URLSearchParams(body);
        const text = params.get('duplexText') || '';

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(`<body style="font-family:sans-serif; background:#e8f4f8; padding:10px;">`);
        res.write(`Gửi lên: "${text}"<br>`);

        const duplexStream = new EchoDuplex();
        duplexStream.on('data', chunk => {
            res.end(`Nhận về từ Duplex stream: <strong style="color:blue;">${chunk.toString()}</strong></body>`);
        });

        duplexStream.write(Buffer.from(text));
    }

    // --- 404 CATCH-ALL ---
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Page Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`[BTH6] Server is running on http://localhost:${PORT}`);
});
