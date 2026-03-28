import sys
import json
import traceback

# Try to import advanced libraries, fall back to standard math if missing
try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False

def analyze():
    try:
        # Read JSON data from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
            
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError:
            print(json.dumps({"success": False, "error": "Invalid JSON input"}))
            return

        nodes = data.get('nodes', [])
        
        if not nodes:
            print(json.dumps({"success": True, "scores": {}}))
            return

        # Prepare features for ML
        node_ids = []
        features = []
        
        for node in nodes:
            metrics = node.get('metrics', {})
            # Ensure we have numeric values
            vol = float(metrics.get('totalVolume', 0))
            cnt = float(metrics.get('transactionCount', 0))
            avg = float(metrics.get('avgAmount', 0))
            mx = float(metrics.get('maxAmount', 0))
            vel = float(metrics.get('velocity', 0))
            
            features.append([vol, cnt, avg, mx, vel])
            node_ids.append(node['id'])

        if HAS_ML_LIBS and len(nodes) >= 5:
            # --- Standard ML Path ---
            df = pd.DataFrame(features, columns=['volume', 'count', 'avg', 'max', 'velocity'])
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(df)
            
            clf = IsolationForest(contamination='auto', random_state=42)
            clf.fit(scaled_features)
            
            # Lower decision_function values = more anomalous
            raw_scores = clf.decision_function(scaled_features)
            
            # Map [-0.5, 0.5] range to [0, 100] risk
            # We want lower decision scores to be higher risk
            min_s = np.min(raw_scores)
            max_s = np.max(raw_scores)
            
            if max_s == min_s:
                normalized_scores = [50.0] * len(raw_scores)
            else:
                normalized_scores = ((max_s - raw_scores) / (max_s - min_s)) * 100
                
            result_scores = {node_ids[i]: float(normalized_scores[i]) for i in range(len(node_ids))}
            print(json.dumps({"success": True, "scores": result_scores}))

        else:
            # --- Robust Statistical Fallback Path (No Dependencies) ---
            # Calculate Z-score style anomaly if ML libs are missing or data is small
            # Features: Volume, Avg Amount, Velocity
            
            def get_stat_score(vals):
                if not vals or len(vals) < 2: return [0] * len(vals)
                avg = sum(vals) / len(vals)
                var = sum((x - avg) ** 2 for x in vals) / len(vals)
                std = var ** 0.5
                if std == 0: return [10.0] * len(vals) # Base background noise
                
                scores = []
                for x in vals:
                    z = (x - avg) / std
                    # Use a sigmoid or exponential-like mapping for more variation
                    # 0.5 + 0.5 * tanh(z) gives a nice 0-100 range
                    score = (z * 15) + 30 # Shifted so normal is ~30
                    scores.append(min(100, max(5, score)))
                return scores

            vols = [f[0] for f in features]
            avgs = [f[2] for f in features]
            vels = [f[4] for f in features]
            
            vol_scores = get_stat_score(vols)
            avg_scores = get_stat_score(avgs)
            vel_scores = get_stat_score(vels)
            
            # Blend factors
            result_scores = {}
            for i in range(len(node_ids)):
                combined = (vol_scores[i] * 0.4 + avg_scores[i] * 0.3 + vel_scores[i] * 0.3)
                result_scores[node_ids[i]] = float(combined)
            
            print(json.dumps({
                "success": True, 
                "scores": result_scores, 
                "info": "Used statistical fallback (ML libs missing or small dataset)"
            }))
        
    except Exception as e:
        print(json.dumps({
            "success": False, 
            "error": str(e),
            "traceback": traceback.format_exc()
        }))

if __name__ == "__main__":
    analyze()
