const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const { spawn } = require('child_process');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

let Graph, scc, centrality;
try {
    Graph = require('graphology');
    scc = require('graphology-components').stronglyConnectedComponents;
    centrality = require('graphology-metrics/centrality');
    console.log('[BACKEND] Graph analytics libraries loaded');
} catch (e) {
    console.warn('[WARNING] Graph analytics libraries (graphology) not found. Advanced risk engine will be limited. Error: ' + e.message);
    console.warn('Please run: npm install graphology graphology-library');
}

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') console.log('Body:', req.body);
    next();
});

// --- OTP Store (Temporary) ---
let tempOtp = {}; // { email: otp_code }

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('[ERROR] Nodemailer Transporter Error:', error);
    } else {
        console.log('[BACKEND] Nodemailer Transporter is ready to send emails');
    }
});

// --- Routes ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { mailId, password } = req.body;

    try {
        // Authenticate using database
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND status = 'active'", [mailId]);
        let isValidPassword = false;
        if (rows.length > 0) {
            isValidPassword = await bcrypt.compare(password, rows[0].password_hash);
        }
        console.log('[DEBUG] Auth isValidPassword:', isValidPassword);

        if (isValidPassword) {
            const user = rows[0];
            console.log('[DEBUG] Auth success for user:', user.email);

            // Log login activity in miniproject_main.Login_user
            try {
                const logParams = [user.name, user.email, user.employee_code || 'N/A', user.role];
                console.log('[DEBUG] Inserting into Login_user with:', logParams);

                await db.query(`
                    INSERT INTO Login_user 
                    (user_name, mail_id, employee_code, role, login_time) 
                    VALUES (?, ?, ?, ?, NOW())
                `, logParams);

                // ALSO record in Audit_Logs for the new page
                await db.query(`
                    INSERT INTO Audit_Logs (user_email, action, details)
                    VALUES (?, ?, ?)
                `, [user.email, 'Login', `User logged in from ${req.headers['user-agent']}`]);

                console.log(`[BACKEND] Login logged successfully in Login_user and Audit_Logs`);
            } catch (logErr) {
                console.error('[ERROR] Login logging failed:', logErr.message);
            }

            res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
        } else {
            console.log('[DEBUG] Auth failed: Invalid email, password, or account not active');
            res.status(401).json({ success: false, message: 'Invalid credentials or account inactive' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Send OTP (Simulated - Logic already in frontend, but backend can support it too)
// For this specific flow, frontend generates random OTP but we can validate it here if we want strict mode.
// Since user asked for backend logic, let's implement the Verify logic here.

app.post('/api/auth/send-otp', async (req, res) => {
    const { mailId } = req.body;
    if (!mailId) return res.status(400).json({ success: false, message: 'Email is required' });

    // Generate random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempOtp[mailId] = otp;

    const mailOptions = {
        from: `"Neurograph System" <${process.env.EMAIL_USER}>`,
        to: mailId,
        subject: 'Your Neurograph Verification Code',
        text: `Hey Neurograph user, your OTP is ${otp}. Please use this to verify your identity.`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #0F0F0F; color: #FFFFFF; border-radius: 10px;">
                <h2 style="color: #3B82F6;">Neurograph Verification</h2>
                <p>Hey Neurograph user,</p>
                <p>Your OTP is: <strong style="font-size: 24px; color: #3B82F6; letter-spacing: 5px;">${otp}</strong></p>
                <p>Please use this code to verify your identity and login to your dashboard.</p>
                <hr style="border-top: 1px solid #333; margin: 20px 0;">
                <p style="font-size: 10px; color: #666;">If you did not request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[BACKEND] Real OTP sent to ${mailId}: ${otp}`);
        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('[ERROR] Failed to send email:', error);
        res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { mailId, otp } = req.body;
    
    if (!mailId || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    if (tempOtp[mailId] === otp) {
        // Clear OTP after successful verification
        delete tempOtp[mailId];
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
});

const multer = require('multer');
const csv = require('csv-parser');

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload CSV and Generate Graph
app.post('/api/upload', upload.single('file'), (req, res) => {
    const adminId = req.body.adminId || 'anonymous';
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log(`[BACKEND] Upload received from admin: ${adminId}`);

    const results = [];
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (data) => {
            // Normalize keys to handle BOM or whitespace
            const normalizedData = {};
            Object.keys(data).forEach(key => {
                const cleanKey = key.replace(/^\ufeff/, '').trim();
                normalizedData[cleanKey] = data[key];
            });
            results.push(normalizedData);
        })
        .on('end', () => {
                const logFile = path.join(__dirname, 'upload_debug.log');
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] Received ${results.length} rows\n`);
                console.log('[BACKEND] CSV Data:', results.length, 'rows');

            try {
                // Process CSV to Graph Data
                const nodesMap = new Map();
                const links = [];
                const transactions = [];
                let minDate = new Date(8640000000000000); // Max date
                let maxDate = new Date(-8640000000000000); // Min date

                results.forEach((row, index) => {
                    let sourceId = (row.SenderName || row.SourceUser || row.Sender || row.Source || row.SenderAccountNo || row.SenderID || 'Unknown').trim();
                    let targetId = (row.AccountHolder || row.TargetUser || row.Target || row.Receiver || row.BeneficiaryUser || row.AccountID || row.AccountNo || 'Unknown').trim();

                    if (sourceId === 'Unknown' && (row.SenderAccountNo || row.SenderID)) sourceId = (row.SenderAccountNo || row.SenderID).trim();
                    if (targetId === 'Unknown' && (row.AccountID || row.AccountNo)) targetId = (row.AccountID || row.AccountNo).trim();

                    const amount = parseFloat(row.Amount || row.Value || 0);
                    const { parse, isValid } = require('date-fns');
                    const dateStr = row.Date || row.Time || row.Timestamp || row.CreatedAt || row.TransactionDate || new Date().toISOString();
                    let dateObj = new Date(dateStr);

                    if (!isValid(dateObj)) {
                        const formats = ['yyyy-MM-dd HH:mm:ss', 'dd-MM-yyyy', 'dd/MM/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy'];
                        for (const fmt of formats) {
                            const parsed = parse(dateStr, fmt, new Date());
                            if (isValid(parsed)) {
                                dateObj = parsed;
                                break;
                            }
                        }
                    }

                    const timestamp = isValid(dateObj) ? dateObj.toISOString() : new Date().toISOString();
                    const timeValue = new Date(timestamp).getTime();

                    if (timeValue < minDate.getTime()) minDate = new Date(timeValue);
                    if (timeValue > maxDate.getTime()) maxDate = new Date(timeValue);

                    if (sourceId && targetId) {
                        if (!nodesMap.has(sourceId)) {
                            nodesMap.set(sourceId, {
                                id: sourceId,
                                user: sourceId,
                                risk: 0,
                                accountNumber: row.SenderAccountNo || row.SenderID || 'N/A'
                            });
                        }
                        if (!nodesMap.has(targetId)) {
                            nodesMap.set(targetId, {
                                id: targetId,
                                user: targetId,
                                risk: 0,
                                accountNumber: row.AccountID || row.AccountNo || 'N/A'
                            });
                        }

                        const isFraud = amount > 50000;
                        links.push({ source: sourceId, target: targetId, color: isFraud ? '#7F1D1D' : '#FACC15', timestamp });
                        transactions.push({
                            id: row.TransactionID || `tx-${index}-${Date.now()}`,
                            source: sourceId,
                            target: targetId,
                            amount,
                            timestamp,
                            type: row.TransactionType || 'Transfer',
                            status: isFraud ? 'Suspicious' : 'Completed',
                            accountBalance: parseFloat(row.AccountBalance || 0),
                            merchantId: row.MerchantID || 'N/A',
                            location: row.Location || 'Unknown',
                            senderName: row.SenderName || sourceId,
                            senderId: row.SenderID || sourceId,
                            senderAccountNo: row.SenderAccountNo || sourceId
                        });
                    }
                });

                // --- DATABASE PERSISTENCE (Part 1: Transactions) ---
                const persistTransactions = async () => {
                    try {
                        console.log(`[BACKEND] Persisting ${transactions.length} transactions to database...`);
                        for (const tx of transactions) {
                            const mysqlDate = tx.timestamp.split('T')[0];
                            const mysqlTime = tx.timestamp.split('T')[1].substring(0, 8);
                            await db.query(`
                                INSERT IGNORE INTO miniproject_main.TRANSACTION 
                                (transaction_id, account_id, account_holder, transaction_type, transaction_date, transaction_time, amount, account_balance, merchant_id, location, sender_name, sender_id, sender_account_no, admin_id)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, [
                                tx.id, tx.target, tx.account_holder || tx.target, tx.type, mysqlDate, mysqlTime,
                                tx.amount, tx.accountBalance, tx.merchantId, tx.location,
                                tx.senderName, tx.senderId, tx.senderAccountNo, adminId
                            ]);
                        }
                        console.log(`[BACKEND] Transaction persistence completed successfully.`);
                    } catch (dbErr) {
                        console.error('[ERROR] Transaction persistence failed:', dbErr.message);
                    }
                };

                // --- DATABASE PERSISTENCE (Part 2: Accounts with Risk Scores) ---
                const persistAccounts = async () => {
                    try {
                        console.log(`[BACKEND] Persisting ${nodesMap.size} accounts with calculated risk scores to database...`);
                        for (const node of nodesMap.values()) {
                            await db.query(`
                                INSERT INTO miniproject_main.ACCOUNT (id, account_no, account_holder_name, risk_score, account_type, admin_id)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE 
                                    account_holder_name = VALUES(account_holder_name),
                                    risk_score = VALUES(risk_score),
                                    admin_id = VALUES(admin_id)
                            `, [node.id, node.accountNumber || 'N/A', node.user, Math.round(node.risk || 0), 'Personal Account', adminId]);
                        }
                        console.log(`[BACKEND] Account risk score persistence completed.`);
                    } catch (dbErr) {
                        console.error('[ERROR] Account persistence failed:', dbErr.message);
                    }
                };

                // --- DATABASE PERSISTENCE (Part 3: Top 3 Risks) ---
                const persistRisks = async (topRisks) => {
                    try {
                        console.log(`[BACKEND] Persisting top 3 high-risk persons for admin ${adminId}...`);
                        for (const riskObj of topRisks) {
                            const riskLevel = riskObj.risk > 80 ? 'Critical' : (riskObj.risk > 50 ? 'High' : 'Medium');
                            await db.query(`
                                INSERT INTO miniproject_main.Risks (admin_id, person_name, account_no, risk_score, risk_level)
                                VALUES (?, ?, ?, ?, ?)
                            `, [adminId, riskObj.user, riskObj.accountNumber || 'N/A', Math.round(riskObj.risk || 0), riskLevel]);
                        }
                        console.log(`[BACKEND] Risk persistence completed.`);
                    } catch (dbErr) {
                        console.error('[ERROR] Risk persistence failed:', dbErr.message);
                    }
                };

                // persistTransactions(); // Removed from here to ensure accounts are persisted first

                // --- Risk Calculation Engine (Pure JS Fallbacks) ---

                // 1. Basic Metrics & Behavioral Analysis
                nodesMap.forEach(node => {
                    const nodeTxs = transactions.filter(t => t.source === node.id || t.target === node.id);
                    const incoming = transactions.filter(t => t.target === node.id);
                    const outgoing = transactions.filter(t => t.source === node.id);

                    const totalVolume = nodeTxs.reduce((sum, t) => sum + t.amount, 0);
                    const avgAmount = nodeTxs.length > 0 ? totalVolume / nodeTxs.length : 0;
                    const maxAmount = nodeTxs.length > 0 ? Math.max(...nodeTxs.map(t => t.amount)) : 0;

                    const durationMs = maxDate.getTime() - minDate.getTime();
                    const durationMin = durationMs > 0 ? durationMs / 60000 : 1;
                    const velocity = nodeTxs.length / durationMin;

                    node.metrics = { totalVolume, avgAmount, maxAmount, velocity, transactionCount: nodeTxs.length, inCount: incoming.length, outCount: outgoing.length };
                });

                // 2. Structural Analysis (Pure JS Loop Detection)
                const sccMap = {};
                const adjacencyList = new Map();
                nodesMap.forEach((_, id) => adjacencyList.set(id, []));
                links.forEach(l => { if (adjacencyList.has(l.source)) adjacencyList.get(l.source).push(l.target); });

                const findCycles = () => {
                    const visited = new Set();
                    const recStack = new Set();
                    const inCycle = new Set();

                    const dfs = (u) => {
                        visited.add(u);
                        recStack.add(u);
                        const neighbors = adjacencyList.get(u) || [];
                        for (const v of neighbors) {
                            if (v === u) continue; // Ignore self-loops for structural risk
                            if (!visited.has(v)) {
                                if (dfs(v)) { inCycle.add(u); return true; }
                            } else if (recStack.has(v)) {
                                inCycle.add(v); inCycle.add(u);
                                return true;
                            }
                        }
                        recStack.delete(u);
                        return false;
                    };
                    nodesMap.forEach((_, id) => { if (!visited.has(id)) dfs(id); });
                    return inCycle;
                };
                const cycleNodes = findCycles();

                // Refined Structural Score: Cycle Member + Degree scaling
                cycleNodes.forEach(id => {
                    const degree = adjacencyList.get(id).length;
                    sccMap[id] = Math.min(100, 70 + (degree * 5)); // Base 70 for loop + 5 per connection
                });

                // 3. Proximity Analysis (Pure JS BFS)
                // DYNAMIC THRESHOLD: Instead of hardcoded 50000, 
                // use nodes with maxAmount > average maxAmount across all nodes
                const nodeValues = Array.from(nodesMap.values());
                const avgMaxAmount = nodeValues.length > 0 ? nodeValues.reduce((sum, n) => sum + n.metrics.maxAmount, 0) / nodeValues.length : 0;
                const dynamicThreshold = Math.max(100, avgMaxAmount); // Minimum threshold for noise reduction
                console.log(`[BACKEND] Proximity Dynamic Threshold: ${dynamicThreshold.toFixed(2)} (Avg: ${avgMaxAmount.toFixed(2)})`);

                const highAmountNodes = nodeValues.filter(n => n.metrics.maxAmount > dynamicThreshold).map(n => n.id);
                const computeDistances = (starts) => {
                    const ds = {};
                    const q = [];
                    starts.forEach(id => { ds[id] = 0; q.push(id); });
                    while (q.length > 0) {
                        const u = q.shift();
                        (adjacencyList.get(u) || []).forEach(v => {
                            if (ds[v] === undefined) { ds[v] = ds[u] + 1; q.push(v); }
                        });
                    }
                    return ds;
                };
                const distances = computeDistances(highAmountNodes);

                // --- Advanced Analytics (Optional) ---
                const finalizeRisk = async (mlScores = {}) => {
                    nodesMap.forEach(node => {
                        const id = node.id;
                        const sccScore = sccMap[id] || 0;
                        const structuralRisk = node.advancedStructural !== undefined ? node.advancedStructural : Math.min(100, sccScore); // Use advanced if available

                        // Behavioral Refinement: Consider volume relative to mean
                        const nodesArray = Array.from(nodesMap.values());
                        const avgSystemVolume = nodesArray.reduce((s, n) => s + n.metrics.totalVolume, 0) / (nodesMap.size || 1);
                        const avgSystemVelocity = nodesArray.reduce((s, n) => s + n.metrics.velocity, 0) / (nodesMap.size || 1);
                        const volumeFactor = node.metrics.totalVolume > avgSystemVolume * 2 ? 100 : (node.metrics.totalVolume / (avgSystemVolume * 2)) * 100;

                        const velocityScore = Math.min(100, node.metrics.velocity * 50); // Increased sensitivity
                        const behavioralRisk = Math.min(100, (velocityScore * 0.4 + volumeFactor * 0.6));

                        // --- Refined ML & Anomaly Logic ---
                        let mlScore = mlScores[id] || 0;

                        // JS-side Statistical Anomaly Fallback (Secondary Fallback)
                        // Uses continuous scoring instead of hard thresholds
                        const volRatio = node.metrics.totalVolume / (avgSystemVolume || 1);
                        const velRatio = node.metrics.velocity / (avgSystemVelocity || 1);

                        let statAnomScore = 0;
                        // Volume-based anomaly (continuous up to 3x avg)
                        statAnomScore += Math.min(50, (volRatio / 3) * 50);
                        // Velocity-based anomaly (continuous up to 5x avg)
                        statAnomScore += Math.min(30, (velRatio / 5) * 30);

                        // Flow imbalance check
                        const flowRatio = node.metrics.inCount > 0 ? node.metrics.outCount / node.metrics.inCount : node.metrics.outCount;
                        if (flowRatio > 5 || flowRatio < 0.2) statAnomScore = Math.min(100, statAnomScore + 20);

                        // Blend mlScore with statistical fallback if Python was inconclusive
                        if (mlScore <= 0) {
                            mlScore = statAnomScore;
                        } else {
                            mlScore = Math.max(mlScore, statAnomScore * 0.6); // Blend
                        }

                        const dist = distances[id];
                        const proximityRisk = dist === 0 ? 100 : dist === undefined ? 0 : Math.max(0, 100 - (dist * 20));

                        node.risk = (0.3 * (structuralRisk || 0) + 0.3 * (behavioralRisk || 0) + 0.3 * (mlScore || 0) + 0.1 * (proximityRisk || 0)) || 0;
                        node.riskDetails = {
                            structural: structuralRisk.toFixed(1),
                            behavioral: behavioralRisk.toFixed(1),
                            ml: mlScore.toFixed(1),
                            proximity: proximityRisk.toFixed(1)
                        };

                        // Apply Colors
                        if (node.risk > 80) node.color = '#7F1D1D';
                        else if (node.risk > 50) node.color = '#EA580C';
                        else if (node.risk > 30) node.color = '#FACC15';
                        else node.color = '#22C55E';
                    });

                    // Update database with final risk scores
                    const updateDB = async () => {
                        await persistAccounts();
                        await persistTransactions();

                        // Update Top 3 Risks
                        const sortedNodes = Array.from(nodesMap.values()).sort((a, b) => b.risk - a.risk);
                        const top3 = sortedNodes.slice(0, 3);
                        await persistRisks(top3);
                    };

                    try {
                        await updateDB();
                        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Database and Model update successful\n`);
                    } catch (err) {
                        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Update failed: ${err.message}\n`);
                        console.error('[ERROR] Update failed:', err);
                    }

                    const graphData = {
                        nodes: Array.from(nodesMap.values()),
                        links: links,
                        transactions: transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
                        metadata: { minDate: minDate.toISOString(), maxDate: maxDate.toISOString(), recordCount: results.length }
                    };

                    const modelPath = path.join(__dirname, 'data', 'model1.json');
                    fs.writeFile(modelPath, JSON.stringify(graphData, null, 4), (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Failed to update graph data' });
                        res.json({ success: true, message: 'Analysis completed (Pure JS Engine)' });
                    });
                };

                if (Graph && scc && centrality) {
                    try {
                        const graph = new Graph({ directed: true });
                        nodesMap.forEach(node => graph.addNode(node.id, { ...node.metrics }));
                        links.forEach(l => { if (graph.hasNode(l.source) && graph.hasNode(l.target)) graph.addEdge(l.source, l.target); });

                        const pagerankScores = centrality.pagerank(graph);
                        const betweennessScores = centrality.betweenness(graph);

                        // Override structural with advanced metrics if available
                        nodesMap.forEach(node => {
                            const pr = (pagerankScores[node.id] || 0) * 1000;
                            const bt = (betweennessScores[node.id] || 0) * 100;
                            const sccScore = sccMap[node.id] || 0; // Still use pure JS SCC for base
                            node.advancedStructural = Math.min(100, (sccScore * 0.5 + pr * 0.25 + bt * 0.25));
                        });
                    } catch (e) { console.error('Advanced analytics failed:', e); }
                }

                // Try ML if possible
                const runML = (graphNodes) => {
                    console.log(`[BACKEND] Starting ML Analysis for ${graphNodes.length} nodes...`);

                    const tryPython = (commands) => {
                        if (commands.length === 0) {
                            console.warn('[BACKEND] All Python command attempts failed. Using JS statistical fallback.');
                            return Promise.resolve({ success: false, scores: {} });
                        }

                        const cmd = commands[0];
                        console.log(`[BACKEND] Attempting ML with command: ${cmd}`);

                        return new Promise((resolve) => {
                            let python;
                            try {
                                python = spawn(cmd, ['ml_analyzer.py']);
                            } catch (e) {
                                console.warn(`[BACKEND] Failed to spawn ${cmd}: ${e.message}`);
                                return resolve(tryPython(commands.slice(1)));
                            }

                            let resStream = '';
                            let errStream = '';

                            python.stdout.on('data', (d) => { resStream += d.toString(); });
                            python.stderr.on('data', (d) => { errStream += d.toString(); });

                            const timeout = setTimeout(() => {
                                console.warn(`[BACKEND] ML Analysis (${cmd}) timed out after 5s`);
                                python.kill();
                                resolve(tryPython(commands.slice(1)));
                            }, 5000);

                            python.on('error', (err) => {
                                clearTimeout(timeout);
                                console.warn(`[BACKEND] Process error with ${cmd}: ${err.message}`);
                                resolve(tryPython(commands.slice(1)));
                            });

                            python.on('close', (code) => {
                                clearTimeout(timeout);
                                if (code !== 0) {
                                    console.warn(`[BACKEND] ML script (${cmd}) exited with code ${code}. Stderr: ${errStream}`);
                                    return resolve(tryPython(commands.slice(1)));
                                }

                                try {
                                    const result = JSON.parse(resStream);
                                    if (result.success) {
                                        console.log(`[BACKEND] ML Analysis (${cmd}) completed successfully`);
                                        resolve(result);
                                    } else {
                                        console.warn(`[BACKEND] ML script (${cmd}) returned error:`, result.error);
                                        resolve(tryPython(commands.slice(1)));
                                    }
                                } catch (e) {
                                    console.warn(`[BACKEND] Failed to parse ML results from ${cmd}. Raw: ${resStream.substring(0, 100)}...`);
                                    resolve(tryPython(commands.slice(1)));
                                }
                            });

                            python.stdin.write(JSON.stringify({ nodes: graphNodes }));
                            python.stdin.end();
                        });
                    };

                    return tryPython(['python', 'python3', 'py']);
                };

                runML(Array.from(nodesMap.values())).then(mlResult => finalizeRisk(mlResult.scores));

            } catch (processError) {
                console.error('[ERROR] Processing CSV:', processError);
                res.status(500).json({ success: false, message: 'Error processing CSV data' });
            }
        });
});

// Search Account
app.get('/api/dashboard/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    try {
        // Search in ACCOUNT table
        const [rows] = await db.query(`
            SELECT 
                id, 
                account_no as number, 
                account_holder_name as holder, 
                risk_score as riskScore,
                account_type
            FROM miniproject_main.ACCOUNT 
            WHERE id = ? OR account_no LIKE ? OR account_holder_name LIKE ?
        `, [query, `%${query}%`, `%${query}%`]);

        if (rows.length > 0) {
            // Add mock flags for the UI
            const account = {
                ...rows[0],
                flags: ['Circular Loop', 'High Frequency']
            };
            res.json({ success: true, data: account });
        } else {
            res.status(404).json({ success: false, message: 'Account not found' });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Helper to generate alerts from graph data
const generateAlerts = (graphData) => {
    const alerts = [];
    const { nodes, links } = graphData;

    // Build Adjacency List for DFS
    const adjacencyList = new Map();
    nodes.forEach(node => adjacencyList.set(node.id, []));

    // Debug
    console.log('[DEBUG] Analysis Nodes:', nodes.length, 'Links:', links.length);

    links.forEach(link => {
        // In model1.json, source/target might be strings (IDs) or objects depending on serialization
        const source = typeof link.source === 'object' ? link.source.id : link.source;
        const target = typeof link.target === 'object' ? link.target.id : link.target;

        if (adjacencyList.has(source)) {
            adjacencyList.get(source).push(target);
        }
    });

    // Detect Cycles using DFS
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const detectCycle = (node, path) => {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        const neighbors = adjacencyList.get(node) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                detectCycle(neighbor, [...path]);
            } else if (recursionStack.has(neighbor)) {
                // Cycle Found: Extract the cycle path
                const cycleStartIndex = path.indexOf(neighbor);
                if (cycleStartIndex !== -1) {
                    cycles.push(path.slice(cycleStartIndex));
                }
            }
        }

        recursionStack.delete(node);
        path.pop();
    };

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            detectCycle(node.id, []);
        }
    });

    // Dedup Cycles
    const uniqueCycles = new Map();
    cycles.forEach(cycle => {
        // Sort to identify same cycle (A->B->C is same set as B->C->A for alert purposes, usually)
        // But for directed loops, order matters. 
        // We'll just key by sorted elements to avoid near-duplicates in UI
        const key = [...cycle].sort().join('|');
        if (!uniqueCycles.has(key)) {
            uniqueCycles.set(key, cycle);
        }
    });

    // Generate Alerts for Unique Cycles
    let alertCounter = 1;
    uniqueCycles.forEach((cycle) => {
        // PER USER REQUEST: Only count loops with 3 or more nodes
        if (cycle.length < 3) return;

        alerts.push({
            id: `alert-cycle-${alertCounter++}`,
            type: 'Critical',
            title: 'Circular Trading',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Active Loop',
            involvedCount: cycle.length,
            amount: 'High Risk',
            involvedNodeIds: cycle,
            color: 'red',
            details: `Loop detected: ${cycle.join(' -> ')} -> ${cycle[0]}`
        });
    });

    return alerts;
};

// In-memory store for resolved cases (reset on server restart)
const resolvedCaseIds = new Set();

// Helper to get node details by ID
const getNodeDetails = (nodes, id) => {
    const node = nodes.find(n => n.id === id);
    return node ? { id: node.id, name: node.user, risk: node.risk } : { id: id, name: 'Unknown Entity', risk: 0 };
};

// Helper to generate cases from graph data
const generateCases = (graphData) => {
    const cases = [];
    const { nodes, links } = graphData;
    let caseIdCounter = 1;

    // 1. Critical Loop Case
    const redLinks = links.filter(l => l.color === '#7F1D1D' || l.color === '#EF4444');
    if (redLinks.length > 0) {
        const involvedNodeIds = new Set();
        redLinks.forEach(l => {
            involvedNodeIds.add(typeof l.source === 'object' ? l.source.id : l.source);
            involvedNodeIds.add(typeof l.target === 'object' ? l.target.id : l.target);
        });

        const caseId = `C-2023-00${caseIdCounter++}`;
        cases.push({
            id: caseId,
            name: 'Circular Loop Investigation',
            date: new Date().toISOString().split('T')[0],
            status: resolvedCaseIds.has(caseId) ? 'Resolved' : 'Active',
            risk: 'Critical',
            entities: involvedNodeIds.size,
            involvedEntities: Array.from(involvedNodeIds).map(id => getNodeDetails(nodes, id)),
            description: `Detected a circular flow of funds involving ${involvedNodeIds.size} entities. This pattern is indicative of potential money laundering or round-tripping.`
        });
    }

    // 2. Suspicious Network Case (Orange Links)
    const orangeLinks = links.filter(l => l.color === '#EA580C');
    if (orangeLinks.length > 0) {
        const involvedNodeIds = new Set();
        orangeLinks.forEach(l => {
            involvedNodeIds.add(typeof l.source === 'object' ? l.source.id : l.source);
            involvedNodeIds.add(typeof l.target === 'object' ? l.target.id : l.target);
        });

        const caseId = `C-2023-00${caseIdCounter++}`;
        cases.push({
            id: caseId,
            name: 'Suspicious Network Activity',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
            status: resolvedCaseIds.has(caseId) ? 'Resolved' : 'Pending',
            risk: 'Medium',
            entities: involvedNodeIds.size,
            involvedEntities: Array.from(involvedNodeIds).map(id => getNodeDetails(nodes, id)),
            description: `Identified a cluster of entities with suspicious high-velocity transactions. The connection patterns suggest non-retail behavior.`
        });
    }

    // 3. High Risk Node Cases
    const highRiskNodes = nodes.filter(n => n.risk > 80);
    highRiskNodes.forEach(node => {
        const caseId = `C-2023-00${caseIdCounter++}`;
        cases.push({
            id: caseId,
            name: `High Risk Entity: ${node.user}`,
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
            status: resolvedCaseIds.has(caseId) ? 'Resolved' : 'Under Review',
            risk: 'High',
            entities: 1,
            involvedEntities: [getNodeDetails(nodes, node.id)],
            description: `User ${node.user} (UID: ${node.id}) has been flagged with a high risk score of ${node.risk}. Immediate review of recent transactions is recommended.`
        });
    });

    return cases;
};

// Get Alerts - Now Dynamic
app.get('/api/dashboard/alerts', (req, res) => {
    const modelPath = path.join(__dirname, 'data', 'model1.json');
    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading model1.json for alerts:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        try {
            const graphData = JSON.parse(data);
            const alerts = generateAlerts(graphData);
            res.json({ success: true, data: alerts });
        } catch (parseErr) {
            console.error('Error parsing model1.json for alerts:', parseErr);
            res.status(500).json({ success: false, message: 'Data Error' });
        }
    });
});

// Get Cases - Dynamic
app.get('/api/dashboard/cases', (req, res) => {
    const modelPath = path.join(__dirname, 'data', 'model1.json');
    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading model1.json for cases:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        try {
            const graphData = JSON.parse(data);
            const cases = generateCases(graphData);
            res.json({ success: true, data: cases });
        } catch (parseErr) {
            console.error('Error parsing model1.json for cases:', parseErr);
            res.status(500).json({ success: false, message: 'Data Error' });
        }
    });
});

// Risks - Fetch from Risks table
app.get('/api/dashboard/risks', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                person_name as name, 
                account_no as accountNumber, 
                risk_score as risk, 
                risk_level as riskLevel,
                detected_at as date
            FROM miniproject_main.Risks 
            ORDER BY risk_score DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching risks:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Graph Data (Mock with Loops)
app.get('/api/dashboard/graph', (req, res) => {
    const modelPath = path.join(__dirname, 'data', 'model1.json');
    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading model1.json:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json({ success: true, data: jsonData });
        } catch (parseErr) {
            console.error('Error parsing model1.json:', parseErr);
            res.status(500).json({ success: false, message: 'Data Error' });
        }
    });
});

// Resolve Case Endpoint
app.post('/api/dashboard/cases/resolve', (req, res) => {
    const { caseId } = req.body;
    if (!caseId) {
        return res.status(400).json({ success: false, message: 'Case ID is required' });
    }
    resolvedCaseIds.add(caseId);
    console.log(`[BACKEND] Resolved case: ${caseId}`);
    res.json({ success: true, message: `Case ${caseId} marked as resolved` });
});

// --- User Features Endpoints ---

// Helper to log audit activity
const logAudit = async (email, action, details) => {
    try {
        await db.query(
            'INSERT INTO miniproject_main.Audit_Logs (user_email, action, details) VALUES (?, ?, ?)',
            [email, action, typeof details === 'object' ? JSON.stringify(details) : details]
        );
    } catch (err) {
        console.error('[ERROR] Audit logging failed:', err.message);
    }
};

// User Settings
app.get('/api/user/settings', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        let [rows] = await db.query('SELECT * FROM miniproject_main.User_Settings WHERE user_email = ?', [email]);
        if (rows.length === 0) {
            // Create default settings if not exists
            await db.query('INSERT INTO miniproject_main.User_Settings (user_email) VALUES (?)', [email]);
            [rows] = await db.query('SELECT * FROM miniproject_main.User_Settings WHERE user_email = ?', [email]);
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/user/settings', async (req, res) => {
    const { email, theme, email_notifications, two_factor_enabled } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        await db.query(`
            UPDATE miniproject_main.User_Settings 
            SET theme = ?, email_notifications = ?, two_factor_enabled = ?
            WHERE user_email = ?
        `, [theme, email_notifications, two_factor_enabled, email]);

        await logAudit(email, 'Update Settings', { theme, email_notifications, two_factor_enabled });
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Audit Logs
app.get('/api/user/audit-logs', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        const [rows] = await db.query(
            'SELECT * FROM miniproject_main.Audit_Logs WHERE user_email = ? ORDER BY timestamp DESC LIMIT 100',
            [email]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Notifications
app.get('/api/user/notifications', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        const [rows] = await db.query(
            'SELECT * FROM miniproject_main.Notifications WHERE user_email = ? ORDER BY timestamp DESC',
            [email]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.patch('/api/user/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE miniproject_main.Notifications SET status = 'read' WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Help Requests
app.post('/api/user/help-request', async (req, res) => {
    const { email, subject, message } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    try {
        await db.query(
            'INSERT INTO miniproject_main.Help_Requests (user_email, subject, message) VALUES (?, ?, ?)',
            [email, subject, message]
        );

        // Also add a system notification for the user
        await db.query(
            'INSERT INTO miniproject_main.Notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)',
            [email, 'Support Ticket Received', `We have received your ticket regarding "${subject}". Our team will respond soon.`, 'info']
        );

        await logAudit(email, 'Help Request', { subject });
        res.json({ success: true, message: 'Help request submitted successfully' });
    } catch (error) {
        console.error('Error submitting help request:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// --- AI Chat Simulation (Gemini) ---
app.post('/api/ai/chat', (req, res) => {
    const { message } = req.body;
    const msg = message.toLowerCase();

    let response = "I'm not sure about that. Could you please provide more details? I'm specifically trained on the NeuroGraph financial analysis platform.";

    if (msg.includes('risk') || msg.includes('score')) {
        response = "Risk scores in NeuroGraph are calculated based on three factors: node centrality (how connected a person is), transaction velocity (speed of money movement), and historical flags. A score above 80 is considered critical.";
    } else if (msg.includes('export') || msg.includes('pdf') || msg.includes('report')) {
        response = "You can export reports as PDF by clicking the 'Export Report' button in the Sidebar. For specific data, you can also download Guidelines and Security Policies from the Help Center.";
    } else if (msg.includes('loop') || msg.includes('circular')) {
        response = "Circular loops are detected when money moves through a series of accounts and returns to the origin. In the Graph View, these are highlighted in red to indicate potential money laundering or suspicious activity.";
    } else if (msg.includes('setting') || msg.includes('theme') || msg.includes('dark')) {
        response = "You can manage your theme and email notification preferences in the 'Account Settings' page. We offer both Dark and Light modes for your comfort.";
    } else if (msg.includes('2fa') || msg.includes('security') || msg.includes('two factor')) {
        response = "Security is our priority. You can enable Two-Factor Authentication (2FA) in the 'Security' section to add an extra layer of protection to your account.";
    } else if (msg.includes('hello') || msg.includes('hi')) {
        response = "Hello! I am your Gemini AI assistant for NeuroGraph. How can I help you navigate the system or understand our financial analytics today?";
    } else if (msg.includes('thank')) {
        response = "You're very welcome! If you have any more questions about our graph analysis or risk engine, feel free to ask.";
    }

    // Add a bit of AI delay and variance
    setTimeout(() => {
        res.json({ success: true, response });
    }, 500);
});

// --- Serve Static Frontend (Production) ---
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route to serve index.html for SPA routing
app.use((req, res) => {
    // Only serve index.html if it's not an API request
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({ success: false, message: 'API route not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
