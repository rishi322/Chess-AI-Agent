const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.post('/getMove', (req, res) => {
    const fen = req.body.fen;
    console.log('Received FEN:', fen);

    const stockfishPath = 'C:\\new chess_project\\socket\\stockfish\\stockfish-windows-x86-64.exe';
    const stockfish = spawn(stockfishPath);

    let output = '';
    let bestMove = '';

    stockfish.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Look for bestmove line
        const match = text.match(/bestmove\s(\w+)/);
        if (match) {
            bestMove = match[1];
            console.log('Best move:', bestMove);
            res.json({ bestMove });
            stockfish.kill();
        }
    });

    stockfish.stderr.on('data', (data) => {
        console.error('Stockfish error:', data.toString());
    });

    stockfish.on('error', (err) => {
        console.error('Failed to start Stockfish:', err);
        res.status(500).json({ error: 'Stockfish failed to start' });
    });

    stockfish.stdin.write('uci\n');
    stockfish.stdin.write('setoption name Skill Level value 20\n');
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write('go movetime 1000\n'); // 1 second move time
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
