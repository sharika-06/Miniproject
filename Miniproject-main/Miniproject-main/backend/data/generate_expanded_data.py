import random
import csv
import datetime

def generate_comprehensive_dataset(filename="comprehensive_transactions_100.csv"):
    headers = [
        "TransactionID", "AccountID", "AccountHolder", "TransactionType", 
        "TransactionDate", "Amount", "AccountBalance", "MerchantID", 
        "Location", "SenderName", "SenderID", "SenderAccountNo"
    ]
    rows = []
    
    start_date = datetime.datetime(2023, 11, 1, 9, 0, 0)
    
    # helper to generate IDs
    def txn_id(i): return f"TXN-{10000 + i}"
    def acc_id(name): return f"ACC-{name.upper()[:3]}-{random.randint(1000, 9999)}"
    
    users = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Niaj"]
    user_accs = {u: acc_id(u) for u in users}
    
    # 1. Normal Background (50 transactions) - Low Risk
    for i in range(50):
        sender = random.choice(users)
        receiver = random.choice([u for u in users if u != sender])
        amount = round(random.uniform(10, 500), 2)
        rows.append([
            txn_id(len(rows)), user_accs[receiver], receiver, "Transfer",
            (start_date + datetime.timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S"),
            amount, 10000, f"M-{random.randint(100, 999)}", "New York",
            sender, f"U-{sender.upper()[:3]}", user_accs[sender]
        ])

    # 2. Structural Risk: Large Loop (Loop_1 -> Loop_2 -> Loop_3 -> Loop_4 -> Loop_1) (12 transactions)
    loop_users = ["Loop_1", "Loop_2", "Loop_3", "Loop_4"]
    loop_accs = {u: f"L-ACC-{u[-1]}00" for u in loop_users}
    for i in range(3): # repeat 3 times
        for j in range(len(loop_users)):
            s = loop_users[j]
            r = loop_users[(j + 1) % len(loop_users)]
            rows.append([
                txn_id(len(rows)), loop_accs[r], r, "Transfer",
                (start_date + datetime.timedelta(days=1, minutes=len(rows)*10)).strftime("%Y-%m-%d %H:%M:%S"),
                450, 5000, "M-LOOP", "London",
                s, f"U-{s.upper()}", loop_accs[s]
            ])

    # 3. Behavioral/ML Risk: High Velocity Burst (15 transactions)
    # Burst_User sends 15 transactions within 30 minutes
    burst_user = "Burst_King"
    burst_acc = "ACC-BURST-99"
    for i in range(15):
        receiver = random.choice(users)
        rows.append([
            txn_id(len(rows)), user_accs[receiver], receiver, "Urgent Transfer",
            (start_date + datetime.timedelta(days=2, minutes=i*2)).strftime("%Y-%m-%d %H:%M:%S"),
            8000, 50000, "M-URGENT", "Berlin",
            burst_user, "U-BURST", burst_acc
        ])

    # 4. Proximity Risk: High Value Seed (10 transactions downstream)
    # Mega_Seed (Very High Risk) -> Broker_1 -> Broker_2 -> Victim_1...
    mega_seed = "Mega_Seed"
    seed_acc = "ACC-SEED-001"
    # The infection source
    rows.append([
        txn_id(len(rows)), seed_acc, mega_seed, "Bulk Deposit",
        (start_date + datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S"),
        500000, 1000000, "M-OFFSHORE", "Cayman Islands",
        "External_Source", "EXT-001", "ACC-EXT-001"
    ])
    
    brokers = ["Broker_A", "Broker_B", "Broker_C"]
    broker_accs = {b: f"ACC-BRK-{b[-1]}" for b in brokers}
    
    # Seed to Brokers
    for b in brokers:
        rows.append([
            txn_id(len(rows)), broker_accs[b], b, "Transfer",
            (start_date + datetime.timedelta(days=3, hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
            25000, 30000, "M-SEED", "Tokyo",
            mega_seed, "U-SEED", seed_acc
        ])
    
    # Brokers to legitimate-looking users
    for b in brokers:
        target = random.choice(users)
        rows.append([
            txn_id(len(rows)), user_accs[target], target, "Payment",
            (start_date + datetime.timedelta(days=3, hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
            2000, 15000, "M-BRK", "Tokyo",
            b, f"U-{b.upper()}", broker_accs[b]
        ])

    # 5. Mixed Risk: "Mule" account (High in/out ratio) (12 transactions)
    mule = "Mule_Mike"
    mule_acc = "ACC-MULE-404"
    for i in range(6):
        # High incoming
        sender = random.choice(users)
        rows.append([
            txn_id(len(rows)), mule_acc, mule, "Transfer",
            (start_date + datetime.timedelta(days=4, hours=i)).strftime("%Y-%m-%d %H:%M:%S"),
            1500, 2000, "M-MULE-IN", "Madrid",
            sender, f"U-{sender.upper()[:3]}", user_accs[sender]
        ])
        # High outgoing
        target = random.choice(users)
        rows.append([
            txn_id(len(rows)), user_accs[target], target, "Transfer",
            (start_date + datetime.timedelta(days=4, hours=i, minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
            1450, 100, "M-MULE-OUT", "Madrid",
            mule, "U-MULE", mule_acc
        ])

    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    
    print(f"Dataset generated: {filename} with {len(rows)} transactions.")

if __name__ == "__main__":
    generate_comprehensive_dataset()
