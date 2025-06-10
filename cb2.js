const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.post('/getMove', (req, res) => {
    const fen = req.body.fen;

    if (!fen) {
        return res.status(400).json({ error: 'FEN string is required' });
    }

    console.log(`Received FEN: ${fen}`);

    const stockfishPath = 'C:\\new chess_project\\socket\\stockfish\\stockfish-windows-x86-64.exe';
    const stockfish = spawn(stockfishPath);

    let moveFound = false;

    stockfish.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        const match = output.match(/bestmove\s(\w{4,5})/);
        if (match && !moveFound) {
            moveFound = true;
            const bestMove = match[1];
            console.log(`Best move found: ${bestMove}`);
            res.json({ bestMove });
            stockfish.stdin.write('quit\n');
            stockfish.kill();
        }
    });

    stockfish.stderr.on('data', (data) => {
        console.error(`Stockfish error: ${data}`);
    });

    stockfish.on('close', (code) => {
        console.log(`Stockfish exited with code ${code}`);
        if (!moveFound) {
            res.status(500).json({ error: 'Failed to get best move' });
        }
    });

    // Send commands to Stockfish
    stockfish.stdin.write('uci\n');
    stockfish.stdin.write('setoption name Skill Level value 20\n');
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write('go movetime 1000\n');  // Think for 1 second
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
