import runPython from "../services/pythonRunner.js";

export const analyzePortfolio = async (req, res) => {
  try {
    const result = await runPython(req.body);
    res.json(result);
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Analysis failed", details: err.toString() });
  }
};