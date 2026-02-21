export const generateDashboardData = () => {
    const nodes = [];
    const links = [];
    const transactions = [];

    // Helper to generate random time today
    const getTimestamp = (hour) => {
        const date = new Date();
        date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        return date.toISOString();
    };

    // 1. Create Normal Nodes (1-15)
    for (let i = 1; i <= 15; i++) {
        nodes.push({
            id: `node-${i}`,
            name: `Account #${8800 + i}`,
            val: Math.random() * 5 + 3, // Size
            group: 'normal',
            risk: Math.floor(Math.random() * 40), // Low risk
            details: 'Standard savings account with regular activity.',
        });
    }

    // 2. Create Fraud Loop Nodes (High Risk)
    const fraudNodes = ['A', 'B', 'C', 'D'];
    fraudNodes.forEach((id, idx) => {
        nodes.push({
            id: `fraud-${id}`,
            name: `Suspect ${id}`,
            val: 8, // Larger
            group: 'fraud',
            risk: 85 + idx, // High risk
            details: 'Flagged for suspicious circular transfer patterns.',
        });
    });

    // 3. Random Connections & Transactions
    nodes.forEach((node, idx) => {
        if (node.group === 'normal') {
            const target = nodes[Math.floor(Math.random() * nodes.length)];
            if (target.id !== node.id) {
                // Create Link
                links.push({
                    source: node.id,
                    target: target.id,
                    value: Math.random() * 2,
                    type: 'normal'
                });

                // Create Transaction
                transactions.push({
                    id: `tx-${idx}-${Date.now()}`,
                    source: node.id,
                    target: target.id,
                    amount: Math.floor(Math.random() * 5000) + 100,
                    timestamp: getTimestamp(9 + Math.floor(Math.random() * 8)), // 9 AM - 5 PM
                    type: 'Transfer',
                    status: 'Completed',
                    isLoop: false,
                });
            }
        }
    });

    // 4. Fraud Loop Connections (A->B->C->D->A)
    const fraudLinks = [
        { source: 'fraud-A', target: 'fraud-B', time: 10 },
        { source: 'fraud-B', target: 'fraud-C', time: 11 },
        { source: 'fraud-C', target: 'fraud-D', time: 12 },
        { source: 'fraud-D', target: 'fraud-A', time: 13 },
    ];

    fraudLinks.forEach((link, idx) => {
        links.push({ ...link, value: 5, type: 'fraud' });
        transactions.push({
            id: `tx-fraud-${idx}`,
            source: link.source,
            target: link.target,
            amount: 50000,
            timestamp: getTimestamp(link.time),
            type: 'Transfer',
            status: 'Suspicious',
            isLoop: true,
        });
    });

    // Sort transactions by time
    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return { nodes, links, transactions };
};
