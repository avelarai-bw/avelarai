const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const parseFile = async (filePath, mimetype) => {
  // CSV or Excel
  if (
    mimetype === 'text/csv' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel'
  ) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet);
    const csv = xlsx.utils.sheet_to_csv(sheet);
    return { text: csv, json, type: 'tabular' };
  }

  // PDF
  if (mimetype === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return { text: data.text, json: null, type: 'document' };
  }

  // Word
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, json: null, type: 'document' };
  }

  throw new Error('Unsupported file type');
};

module.exports = { parseFile };