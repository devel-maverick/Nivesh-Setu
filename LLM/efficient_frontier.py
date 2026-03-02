import numpy as np

def generate_frontier(mean_returns, cov_matrix, num_portfolios=200):
    num_assets = len(mean_returns)
    frontier_points = []
    
    for _ in range(num_portfolios):
        weights = np.random.random(num_assets)
        weights /= np.sum(weights)
        
        port_return = np.sum(mean_returns * weights) * 252
        
        port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix * 252, weights)))
        
        frontier_points.append({
            "volatility": float(port_volatility),
            "return": float(port_return)
        })
        
    return frontier_points
