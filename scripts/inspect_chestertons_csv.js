const fs = require('fs');
const path = require('path');

const file1 = '/Users/cristianvaduva/Downloads/exportcereri650861915202610713381138618.csv';
const file2 = '/Users/cristianvaduva/Downloads/exportcereri650861915202610713383238394.csv';

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
      rows.push(currentRow);
    }
  }
  return rows;
}

const f1 = parseCSV(file1);
const f2 = parseCSV(file2);

console.log('File 1 total rows (inc header):', f1.length, 'cols:', f1[0].length);
console.log('File 2 total rows (inc header):', f2.length, 'cols:', f2[0].length);

const headers1 = f1[0];
const headers2 = f2[0];
console.log('Headers match exactly?:', JSON.stringify(headers1) === JSON.stringify(headers2));
console.log('Headers:', headers1);

const rows1 = f1.slice(1);
const rows2 = f2.slice(1);
console.log('File 1 data rows:', rows1.length);
console.log('File 2 data rows:', rows2.length);
console.log('Total combined rows:', rows1.length + rows2.length);

const allRows = [...rows1, ...rows2];
const idMap = new Map();
let duplicateCount = 0;

allRows.forEach((r, idx) => {
  const id = r[0];
  if (idMap.has(id)) {
    duplicateCount++;
    console.log(`Duplicate ID found: ${id} at row ${idx}`);
  }
  idMap.set(id, r);
});

console.log('Unique IDs:', idMap.size, 'Duplicate IDs:', duplicateCount);

// Verify Tip Lead
const tipLeadCounts = {};
allRows.forEach(r => {
  const tipLead = r[8]; // index 8 is Tip Lead
  tipLeadCounts[tipLead] = (tipLeadCounts[tipLead] || 0) + 1;
});
console.log('Tip Lead distribution:', tipLeadCounts);

// Verify StatusCerere
const statusCounts = {};
allRows.forEach(r => {
  const status = r[37]; // index 37 is StatusCerere
  statusCounts[status || 'BLANK'] = (statusCounts[status || 'BLANK'] || 0) + 1;
});
console.log('StatusCerere distribution:', statusCounts);

// Verify Sursa
const sursaCounts = {};
allRows.forEach(r => {
  const sursa = r[14]; // index 14 is Sursa
  sursaCounts[sursa || 'BLANK'] = (sursaCounts[sursa || 'BLANK'] || 0) + 1;
});
console.log('Sursa distribution:', sursaCounts);

// Verify Contact (Email OR Telefon)
let hasContactCount = 0;
allRows.forEach(r => {
  const email = r[6];
  const phone = r[7];
  if ((email && email.trim()) || (phone && phone.trim())) {
    hasContactCount++;
  }
});
console.log('Records with Email OR Phone:', hasContactCount, 'out of', allRows.length);
