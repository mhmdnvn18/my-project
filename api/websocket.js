const { WebSocketServer } = require('ws');
const http = require('http');

const wss = new WebSocketServer({ noServer: true });
let clients = [];

// Event ketika client terhubung
wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('Client connected, total clients:', clients.length);

    // Handle pesan dari client
    ws.on('message', (message) => {
        console.log('Message received:', message);

        // Kirim pesan ke semua client
        clients.forEach(client => {
            if (client.readyState === 1) { // 1 = OPEN
                client.send(message);
            }
        });
    });

    // Handle disconnect
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected, total clients:', clients.length);
    });
});

// Handler HTTP untuk Vercel (untuk WebSocket)
function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).send('WebSocket server is running!');
    } else if (req.method === 'POST') {
        res.status(200).send('Data received via POST');
    } else {
        res.status(405).send('Method Not Allowed');
    }
}

// Buat server HTTP
const server = http.createServer(handler);

// Hubungkan WebSocketServer ke server HTTP
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Jalankan server di port 443
server.listen(443, () => {
    console.log('Server is listening on port 443');
});

// Konfigurasi API untuk Vercel
export const config = {
    api: {
        bodyParser: false,  // Disable bodyParser untuk WebSocket
    },
};