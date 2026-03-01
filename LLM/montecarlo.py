import numpy as np


def run_monte_carlo(mean_returns, cov_matrix, weights, simulations=1000, days=30):
    """Run Monte Carlo simulation and return VaR(95%) as a LOSS percentage, 
    plus the day-by-day paths for the 5th, 50th, and 95th percentiles.

    Returns:
        dict: {
            "var_loss_pct": float,
            "paths": {
                "p5": [float, ...],
                "p50": [float, ...],
                "p95": [float, ...],
            }
        }
    """
    weights = np.array(weights)
    all_paths = []
    
    for _ in range(simulations):
        simulated = np.random.multivariate_normal(
            mean_returns, cov_matrix, days
        )
        # We start the path at 100 for percentage-based tracking (like frontend does)
        portfolio_series = 1 + np.dot(simulated, weights)
        # Prepend 1.0 (or 100 on absolute scale) to have day 0 start at 100
        cum_path = np.concatenate(([1.0], np.cumprod(portfolio_series))) * 100
        all_paths.append(cum_path)

    # all_paths shape: (simulations, days + 1)
    all_paths = np.array(all_paths)
    
    # Calculate daily percentiles
    p5_path = np.percentile(all_paths, 5, axis=0).tolist()
    p50_path = np.percentile(all_paths, 50, axis=0).tolist()
    p95_path = np.percentile(all_paths, 95, axis=0).tolist()

    # The 5th-percentile cumulative return on the LAST day relative to start (100)
    final_p5 = float(p5_path[-1]) / 100.0
    
    # Convert to a positive loss %. E.g. path=0.865 → loss=13.5%
    var_loss_pct = round((1.0 - final_p5) * 100, 2)
    
    return {
        "var_loss_pct": var_loss_pct,
        "paths": {
            "p5": p5_path,
            "p50": p50_path,
            "p95": p95_path
        }
    }