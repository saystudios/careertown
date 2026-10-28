const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 840 } });
  for (const n of ['kpop-booth', 'kpop-dressing', 'kpop-stage']) {
    await p.setContent(`<html><body style="margin:0">${fs.readFileSync(n + '.svg', 'utf8')}</body></html>`);
    await p.screenshot({ path: n + '.png', clip: { x: 0, y: 0, width: 1920, height: 840 } });
  }
  await b.close(); })();
