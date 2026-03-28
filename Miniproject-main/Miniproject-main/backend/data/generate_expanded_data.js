const fs = require('fs');
const path = require('path');

function generateDataset() {
    const filename = path.join(__dirname, 'comprehensive_transactions_100.csv');
    const headers = [
        "TransactionID", "AccountID", "AccountHolder", "TransactionType",
        "TransactionDate", "Amount", "AccountBalance", "MerchantID",
        "Location", "SenderName", "SenderID", "SenderAccountNo"
    ];

    const rows = [headers.join(',')];
    let start_date = new Date(2023, 10, 1, 9, 0, 0); // Nov 1st

    const users = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Niaj"];
    const userAccs = {};
    users.forEach(u => {
        userAccs[u] = `ACC-${u.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    });

    const txnId = (i) => `TXN-${10000 + i}`;

    // 1. Normal Background (50 transactions)
    for (let i = 0; i < 50; i++) {
        const sender = users[Math.floor(Math.random() * users.length)];
        const receiver = users.filter(u => u !== sender)[Math.floor(Math.random() * (users.length - 1))];
        const amount = (10 + Math.random() * 490).toFixed(2);
        const date = new Date(start_date.getTime() + i * 3600000);
        rows.push([
            txnId(rows.length), userAccs[receiver], receiver, "Transfer",
            date.toISOString().replace('T', ' ').substring(0, 19),
            amount, "10000", `M-${Math.floor(100 + Math.random() * 899)}`, "New York",
            sender, `U-${sender.substring(0, 3).toUpperCase()}`, userAccs[sender]
        ].join(','));
    }

    // 2. Structural Risk: Loop (Loop_1 -> Loop_2 -> Loop_3 -> Loop_4 -> Loop_1)
    const loopUsers = ["Loop1", "Loop2", "Loop3", "Loop4"];
    const loopAccs = {
        "Loop1": "L-ACC-100", "Loop2": "L-ACC-200", "Loop3": "L-ACC-300", "Loop4": "L-ACC-400"
    };
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < loopUsers.length; j++) {
            const s = loopUsers[j];
            const r = loopUsers[(j + 1) % loopUsers.length];
            const date = new Date(start_date.getTime() + (50 * 3600000) + (i * 4 + j) * 600000);
            rows.push([
                txnId(rows.length), loopAccs[r], r, "Transfer",
                date.toISOString().replace('T', ' ').substring(0, 19),
                "500", "5000", "M-LOOP", "London",
                s, `U-${s.toUpperCase()}`, loopAccs[s]
            ].join(','));
        }
    }

    // 3. Behavioral/ML Risk: Burst
    const burstUser = "BurstKing";
    const burstAcc = "ACC-BURST-99";
    for (let i = 0; i < 15; i++) {
        const receiver = users[Math.floor(Math.random() * users.length)];
        const date = new Date(start_date.getTime() + (2 * 24 * 3600000) + i * 120000);
        rows.push([
            txnId(rows.length), userAccs[receiver], receiver, "Urgent Transfer",
            date.toISOString().replace('T', ' ').substring(0, 19),
            "8500", "50000", "M-URGENT", "Berlin",
            burstUser, "U-BURST", burstAcc
        ].join(','));
    }

    // 4. Proximity Risk: Seed
    const megaSeed = "MegaSeed";
    const seedAcc = "ACC-SEED-001";
    const seedDate = new Date(start_date.getTime() + 3 * 24 * 3600000);
    rows.push([
        txnId(rows.length), seedAcc, megaSeed, "Bulk Deposit",
        seedDate.toISOString().replace('T', ' ').substring(0, 19),
        "500000", "1000000", "M-OFFSHORE", "Cayman Islands",
        "ExternalSource", "EXT-001", "ACC-EXT-001"
    ].join(','));

    const brokers = ["BrokerA", "BrokerB", "BrokerC"];
    const brokerAccs = { "BrokerA": "ACC-BRK-1", "BrokerB": "ACC-BRK-2", "BrokerC": "ACC-BRK-3" };
    brokers.forEach((b, idx) => {
        const date = new Date(seedDate.getTime() + (idx + 1) * 3600000);
        rows.push([
            txnId(rows.length), brokerAccs[b], b, "Transfer",
            date.toISOString().replace('T', ' ').substring(0, 19),
            "50000", "60000", "M-SEED", "Tokyo",
            megaSeed, "U-SEED", seedAcc
        ].join(','));
    });

    brokers.forEach((b, idx) => {
        const target = users[Math.floor(Math.random() * users.length)];
        const date = new Date(seedDate.getTime() + (idx + 4) * 3600000);
        rows.push([
            txnId(rows.length), userAccs[target], target, "Payment",
            date.toISOString().replace('T', ' ').substring(0, 19),
            "2000", "15000", "M-BRK", "Tokyo",
            b, `U-${b.toUpperCase()}`, brokerAccs[b]
        ].join(','));
    });

    // 5. Mixed: Mule
    const mule = "MuleMike";
    const muleAcc = "ACC-MULE-404";
    for (let i = 0; i < 8; i++) {
        const date = new Date(start_date.getTime() + 4 * 24 * 3600000 + i * 3600000);
        // In
        const sender = users[Math.floor(Math.random() * users.length)];
        rows.push([
            txnId(rows.length), muleAcc, mule, "Transfer",
            date.toISOString().replace('T', ' ').substring(0, 19),
            "2500", "3000", "M-MULE-IN", "Madrid",
            sender, `U-${sender.substring(0, 3).toUpperCase()}`, userAccs[sender]
        ].join(','));
        // Out
        const target = users[Math.floor(Math.random() * users.length)];
        rows.push([
            txnId(rows.length), userAccs[target], target, "Transfer",
            new Date(date.getTime() + 1800000).toISOString().replace('T', ' ').substring(0, 19),
            "2450", "100", "M-MULE-OUT", "Madrid",
            mule, "U-MULE", muleAcc
        ].join(','));
    }

    fs.writeFileSync(filename, rows.join('\n'));
    console.log(`Generated ${rows.length - 1} transactions in ${filename}`);
}

generateDataset();
