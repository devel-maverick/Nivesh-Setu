import runPython from "../services/pythonRunner.js";

export const analyzePortfolio = async (req, res) => {
  try {
    const result = await runPython(req.body);
    if (result && result.error) {
      return res.status(400).json({ error: "Bad request", details: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Analysis failed", details: err.toString() });
  }
};