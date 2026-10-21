const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const XLSX = require('xlsx');

async function main() {
  console.log('--- Inspecting Excel 1 ---');
  const wb1 = XLSX.readFile('public/Consolidated_Menu_Updated_Final.xlsx');
  console.log('wb1 sheets:', wb1.SheetNames);
  for (const name of wb1.SheetNames) {
    const data = XLSX.utils.sheet_to_json(wb1.Sheets[name], { header: 1 });
    console.log(`Sheet "${name}" has ${data.length} rows`);
    fs.writeFileSync(`scratch_wb1_${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`, JSON.stringify(data, null, 2));
  }

  console.log('--- Inspecting Excel 2 ---');
  const wb2 = XLSX.readFile('public/Consolidated_8_Dinner_Menus.xlsx');
  console.log('wb2 sheets:', wb2.SheetNames);
  for (const name of wb2.SheetNames) {
    const data = XLSX.utils.sheet_to_json(wb2.Sheets[name], { header: 1 });
    console.log(`Sheet "${name}" has ${data.length} rows`);
    fs.writeFileSync(`scratch_wb2_${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`, JSON.stringify(data, null, 2));
  }

  console.log('--- Inspecting PDFs ---');
  async function dumpPdf(file, out) {
    try {
      const buffer = fs.readFileSync(file);
      const parser = new PDFParse(new Uint8Array(buffer));
      const res = await parser.getText();
      const text = res && res.text ? res.text : (typeof res === 'string' ? res : JSON.stringify(res));
      console.log(`${file}: length=${text.length}`);
      fs.writeFileSync(out, text);
    } catch (e) {
      console.log(`Error parsing ${file}: ${e.message}`);
    }
  }

  await dumpPdf('public/RPG-Catering-Master-Menu-Catalog.pdf', 'scratch_master.txt');
  await dumpPdf('public/RPG-Special-Dinner-Menu-Collection.pdf', 'scratch_dinner.txt');
  // For marriage-food.pdf, check if text or if image-based
  await dumpPdf('public/marriage-food.pdf', 'scratch_marriage.txt');

  console.log('Done dump!');
}

main().catch(console.error);
