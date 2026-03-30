const Groq = require('groq-sdk');

const analyzeData = async (parsedText, fileType, fileName) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const isTabular = fileType === 'tabular';

  const prompt = isTabular
    ? `You are a senior data analyst. A user has uploaded a dataset called "${fileName}".
Here is the data in CSV format:

${parsedText.slice(0, 8000)}

Analyze this dataset thoroughly and respond ONLY with a valid JSON object in this exact structure, no markdown fences, no extra text:
{
  "summary": "2-3 sentence plain English summary of what this dataset is about",
  "statistics": {
    "rowCount": <number>,
    "columnCount": <number>,
    "columns": [
      {
        "name": "<column name>",
        "type": "<numeric|categorical|date>",
        "mean": <number or null>,
        "median": <number or null>,
        "mode": <value or null>,
        "stdDev": <number or null>,
        "variance": <number or null>,
        "min": <number or null>,
        "max": <number or null>,
        "nullCount": <number>
      }
    ]
  },
  "interpretation": "A detailed paragraph interpreting the data, highlighting patterns, outliers, and what the numbers mean in plain English",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "chartSuggestions": [
    {
      "type": "<bar|line|pie>",
      "title": "<chart title>",
      "xKey": "<column name for x axis>",
      "yKey": "<column name for y axis>"
    }
  ]
}`
    : `You are a senior data analyst. A user has uploaded a document called "${fileName}".
Here is the document content:

${parsedText.slice(0, 8000)}

Analyze this document and respond ONLY with a valid JSON object in this exact structure, no markdown fences, no extra text:
{
  "summary": "2-3 sentence plain English summary of what this document is about",
  "statistics": null,
  "interpretation": "A detailed paragraph interpreting the content, key themes, and important findings",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "chartSuggestions": []
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const raw = completion.choices[0].message.content || '';
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { analyzeData };