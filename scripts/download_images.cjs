const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/products.json'), 'utf-8'));
const targetDir = path.join(__dirname, '../assets/img/products/dck');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function processProduct(prod, index) {
  const destPath = path.join(__dirname, '..', prod.image.replace(/^\//, ''));
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return;
  }

  try {
    const cleanUrl = prod.yandexUrl.split('?')[0];
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(cleanUrl)}`;
    const json = await getJson(apiUrl);
    if (!json.href) {
      console.error(`  No download href for ${prod.sku}:`, json.message || json);
      return;
    }
    await downloadFile(json.href, destPath);
    const size = (fs.statSync(destPath).size / 1024 / 1024).toFixed(2);
    console.log(`[${index + 1}/${products.length}] Downloaded ${prod.sku} -> ${size} MB`);
  } catch (err) {
    console.error(`  Failed to download ${prod.sku}:`, err.message);
  }
}

async function main() {
  const CONCURRENCY = 5;
  console.log(`Starting parallel download (concurrency ${CONCURRENCY})...`);
  
  let currentIndex = 0;
  async function worker() {
    while (currentIndex < products.length) {
      const idx = currentIndex++;
      await processProduct(products[idx], idx);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log('All parallel downloads finished!');
}

main().catch(console.error);
