const { spawn } = require('child_process');
const fs = require('fs');

const dummyData = {
    nodes: [
        { id: '1', metrics: { totalVolume: 100, transactionCount: 1, avgAmount: 100, maxAmount: 100, velocity: 1 } },
        { id: '2', metrics: { totalVolume: 200, transactionCount: 2, avgAmount: 100, maxAmount: 100, velocity: 1 } },
        { id: '3', metrics: { totalVolume: 300, transactionCount: 3, avgAmount: 100, maxAmount: 100, velocity: 1 } },
        { id: '4', metrics: { totalVolume: 400, transactionCount: 4, avgAmount: 100, maxAmount: 100, velocity: 1 } },
        { id: '5', metrics: { totalVolume: 10000, transactionCount: 10, avgAmount: 1000, maxAmount: 5000, velocity: 5 } }
    ]
};

const python = spawn('python', ['ml_analyzer.py']);
let stdout = '';
let stderr = '';

python.stdout.on('data', (d) => { stdout += d.toString(); });
python.stderr.on('data', (d) => { stderr += d.toString(); });

python.on('close', (code) => {
    const result = {
        code,
        stdout,
        stderr
    };
    fs.writeFileSync('diag_result.json', JSON.stringify(result, null, 2));
    process.exit(0);
});

python.on('error', (err) => {
    fs.writeFileSync('diag_result.json', JSON.stringify({ error: err.message }, null, 2));
    process.exit(0);
});

python.stdin.write(JSON.stringify(dummyData));
python.stdin.end();
