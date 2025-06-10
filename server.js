const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

app.use(express.json());
const cors = require('cors');

app.use(cors());

app.post('/getMove', (req, res) => {
    const fen = req.body.fen;
    console.log(fen);

    const stockfishPath = 'C:\\new chess_project\\socket\\stockfish\\stockfish-windows-x86-64.exe';

    const stockfishProcess = exec(`"${stockfishPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Stockfish: ${error}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const bestMove = stdout.trim();
        console.log(bestMove);
        res.json({ bestMove });
    });

    stockfishProcess.stdin.write('uci\n');
    stockfishProcess.stdin.write('setoption name Skill Level value 20\n');
    stockfishProcess.stdin.write(`position fen ${fen}\n`);
    stockfishProcess.stdin.write('d\n');  // Display current board to check settings
    stockfishProcess.stdin.write('go movetime 100000\n');
    stockfishProcess.stdin.write('quit\n');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
