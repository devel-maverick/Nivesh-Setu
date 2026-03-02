import numpy as np


def run_monte_carlo(mean_returns, cov_matrix, weights, simulations=1000, days=30):

    weights = np.array(weights)
    all_paths = []
    
    for _ in range(simulations):
        simulated = np.random.multivariate_normal(
            mean_returns, cov_matrix, days
        )
        portfolio_series = 1 + np.dot(simulated, weights)
        cum_path = np.concatenate(([1.0], np.cumprod(portfolio_series))) * 100
        all_paths.append(cum_path)

    all_paths = np.array(all_paths)
    
    p5_path = np.percentile(all_paths, 5, axis=0).tolist()
    p50_path = np.percentile(all_paths, 50, axis=0).tolist()
    p95_path = np.percentile(all_paths, 95, axis=0).tolist()

    final_p5 = float(p5_path[-1]) / 100.0
    
    var_loss_pct = round((1.0 - final_p5) * 100, 2)
    
    return {
        "var_loss_pct": var_loss_pct,
        "paths": {
            "p5": p5_path,
            "p50": p50_path,
            "p95": p95_path
        }
    }