import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1
});
await page.setContent(
	`<html><head><style>@font-face{font-family:A2OSans;src:url(data:font/woff2;base64,${(await fs.readFile('static/fonts/A2OSans-Subset.woff2')).toString('base64')} )}*{box-sizing:border-box}body{margin:0;background:#F7F8F4;color:#162A33;font-family:A2OSans,system-ui}main{padding:65px 70px}.brand{font-weight:850;font-size:35px}.kicker{font-size:13px;color:#286875;margin-top:75px;letter-spacing:2px}h1{font-size:62px;line-height:1.25;margin:22px 0}p{font-size:21px;color:#586B74}.instrument{position:absolute;right:65px;top:62px;width:330px;height:505px;background:#102832;border-radius:20px;color:#C2D2D5;padding:28px}.instrument small{font:11px monospace}.instrument svg{width:100%;height:280px}.instrument b{font:25px monospace;color:#E6BB82}.instrument p{font-size:12px;color:#C2D2D5}</style></head><body><main><div class="brand">A2O <span style="font-size:12px;font-weight:500;margin-left:14px">ATOM TO ORBIT</span></div><div class="kicker">INDEPENDENT SCIENCE ATLAS</div><h1>모든 크기에는<br/>이야기가 있다.</h1><p>원자에서 궤도까지. 눈금으로 이해하는 세상의 크기.</p></main><div class="instrument"><small>01 / SCALE EXPLORER</small><svg viewBox="0 0 300 280"><g fill="none" stroke="#53747D"><circle cx="150" cy="140" r="100"/><circle cx="150" cy="140" r="75" stroke-dasharray="3 5"/><path d="M20 140H280M150 10V270"/></g><circle cx="150" cy="140" r="52" fill="#397987" stroke="#87ADAB"/><ellipse cx="150" cy="140" rx="24" ry="52" fill="none" stroke="#87ADAB"/><ellipse cx="150" cy="140" rx="52" ry="20" fill="none" stroke="#87ADAB"/></svg><p>지구 · 체적 평균 지름</p><b>1.27 × 10⁷ m</b><p>약 12,742 km · NASA Earth Fact Sheet</p></div></body></html>`
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'static/og-default.png' });
await page.goto(new URL('../A2O_HOMEPAGE_REFERENCE.html', import.meta.url).href);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: 'artifacts/reference-desktop.png', fullPage: true });
await browser.close();
