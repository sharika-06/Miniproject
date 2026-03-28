const fs = require('fs');

// Mock data
const nodesMap = new Map([
    ['Normal1', { id: 'Normal1', metrics: { totalVolume: 1000, velocity: 1, inCount: 5, outCount: 5 } }],
    ['Normal2', { id: 'Normal2', metrics: { totalVolume: 1100, velocity: 1.1, inCount: 5, outCount: 5 } }],
    ['Outlier1', { id: 'Outlier1', metrics: { totalVolume: 10000, velocity: 10, inCount: 1, outCount: 20 } }],
    ['Normal3', { id: 'Normal3', metrics: { totalVolume: 900, velocity: 0.9, inCount: 5, outCount: 5 } }]
]);

function calculateMLFallback(nodesMap) {
    const results = {};
    const nodes = Array.from(nodesMap.values());
    const avgSystemVolume = nodes.reduce((s, n) => s + n.metrics.totalVolume, 0) / nodes.length;
    const avgSystemVelocity = nodes.reduce((s, n) => s + n.metrics.velocity, 0) / nodes.length;

    console.log(`System Avg Volume: ${avgSystemVolume}`);
    console.log(`System Avg Velocity: ${avgSystemVelocity}`);

    nodes.forEach(node => {
        let statAnomScore = 0;
        if (node.metrics.totalVolume > avgSystemVolume * 2) statAnomScore += 40;
        if (node.metrics.totalVolume > avgSystemVolume * 5) statAnomScore += 30;
        if (node.metrics.velocity > avgSystemVelocity * 3) statAnomScore += 30;

        const flowRatio = node.metrics.inCount > 0 ? node.metrics.outCount / node.metrics.inCount : node.metrics.outCount;
        if (flowRatio > 10 || flowRatio < 0.1) statAnomScore = Math.min(100, statAnomScore + 20);

        results[node.id] = statAnomScore;
    });
    return results;
}

const scores = calculateMLFallback(nodesMap);
console.log('--- Statistical Anomaly Fallback Results ---');
Object.entries(scores).forEach(([id, score]) => {
    console.log(`${id}: ${score}%`);
});

const outlierScore = scores['Outlier1'];
if (outlierScore > 50) {
    console.log('SUCCESS: Outlier correctly identified with non-zero score.');
} else {
    console.log('FAILURE: Outlier score too low.');
    process.exit(1);
}
