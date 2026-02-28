import numpy as np


def run_monte_carlo(mean_returns, cov_matrix, weights, simulations=1000, days=30):
    """Run Monte Carlo simulation and return VaR(95%) as a LOSS percentage.

    Returns a positive float representing the worst-case loss at the 5th
    percentile of simulated 30-day outcomes. E.g. 13.5 means the portfolio
    loses 13.5% in the worst 5% of scenarios.
    """
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

    # 5th-percentile cumulative return (path end value)
    p5_path = float(np.percentile(results, 5))

    # Convert to a positive loss %. E.g. path=0.865 → loss=13.5%
    var_loss_pct = round((1.0 - p5_path) * 100, 2)
    return var_loss_pct