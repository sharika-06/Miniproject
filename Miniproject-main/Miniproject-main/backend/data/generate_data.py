import random
import csv
import datetime

def generate_risky_dataset(filename="dummy_transactions_risky.csv"):
    headers = ["SenderName", "Receiver", "Amount", "Timestamp"]
    rows = []
    
    # 1. Start with some normal background transactions (~70 rows)
    users = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy"]
    start_date = datetime.datetime(2023, 10, 1, 10, 0, 0)
    
    for i in range(70):
        sender = random.choice(users)
        receiver = random.choice([u for u in users if u != sender])
        amount = round(random.uniform(50, 800), 2)
        timestamp = (start_date + datetime.timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
        rows.append([sender, receiver, amount, timestamp])
        
    # 2. Structural Risk: Loop (A -> B -> C -> A) (~9 rows)
    # This will trigger high structural risk
    loop_users = ["Loop_A", "Loop_B", "Loop_C"]
    for i in range(3):
        rows.append(["Loop_A", "Loop_B", 500, (start_date + datetime.timedelta(days=1, hours=i)).strftime("%Y-%m-%d %H:%M:%S")])
        rows.append(["Loop_B", "Loop_C", 500, (start_date + datetime.timedelta(days=1, minutes=i*10)).strftime("%Y-%m-%d %H:%M:%S")])
        rows.append(["Loop_C", "Loop_A", 500, (start_date + datetime.timedelta(days=1, minutes=i*20)).strftime("%Y-%m-%d %H:%M:%S")])
        
    # 3. ML Anomaly: High Volume & Velocity (~10 rows)
    # Outlier_User sends many high-value transactions in short time
    for i in range(10):
        rows.append(["Outlier_User", random.choice(users), 9500, (start_date + datetime.timedelta(days=2, minutes=i*2)).strftime("%Y-%m-%d %H:%M:%S")])
        
    # 4. Proximity Risk: Connected to High-Risk Seed (~11 rows)
    # Seed_X sends a HUGE amount, then Bob connects to it
    rows.append(["Seed_X", "Retailer_Y", 85000, (start_date + datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")])
    # Connection chain: Seed_X -> Broker_Z -> Victim_V
    rows.append(["Seed_X", "Broker_Z", 1000, (start_date + datetime.timedelta(days=3, hours=1)).strftime("%Y-%m-%d %H:%M:%S")])
    rows.append(["Broker_Z", "Victim_V", 800, (start_date + datetime.timedelta(days=3, hours=2)).strftime("%Y-%m-%d %H:%M:%S")])
    
    # Random fill to reach 100
    while len(rows) < 100:
        rows.append([random.choice(users), random.choice(users), random.uniform(10, 100), start_date.strftime("%Y-%m-%d %H:%M:%S")])

    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    
    print(f"Dataset generated: {filename}")

if __name__ == "__main__":
    generate_risky_dataset()
