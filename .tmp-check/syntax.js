const fs = require('fs');
const html = fs.readFileSync('casino.html', 'utf8');
const re = /<script>([\s\S]*?)<\/script>/g;
let m, i = 0, bad = 0;
while ((m = re.exec(html))) {
  try { new Function(m[1]); console.log('block ' + i + ': ok (' + m[1].length + ' chars)'); }
  catch (e) { bad++; console.log('block ' + i + ': FAILED -> ' + e.message); }
  i++;
}
console.log(bad ? 'SYNTAX FAIL' : 'SYNTAX OK, ' + i + ' inline blocks');
process.exit(bad ? 1 : 0);
