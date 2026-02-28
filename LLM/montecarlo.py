import numpy as np
def run_monte_carlo(mean_returns, cov_matrix, weights, simulations=1000, days=30):
    weights = np.array(weights)
    results = []
    for _ in range(simulations):
        simulated = np.random.multivariate_normal(
            mean_returns, cov_matrix, days
        )
        portfolio_path = np.cumprod(
            1 + np.dot(simulated, weights)
        )
        results.append(portfolio_path[-1])

    var_95 = 1.0 - np.percentile(results, 5) 

    return float(var_95)