'use strict';

const path = require('path');
const { execFileSync } = require('child_process');

async function seedCatalog() {
  if (!process.env.DATABASE_URL) {
    console.warn('MIGA catalog seed skipped: DATABASE_URL is not configured');
    return;
  }

  let Pool;
  try {
    ({ Pool } = require('pg'));
  } catch {
    execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--no-save', '--no-audit', '--no-fund', 'pg@8.13.1'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '' }
    });
    ({ Pool } = require('pg'));
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 2
  });

  try {
    const priceResult = await pool.query(
      `SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY price), 0)::numeric(10,2) AS price
       FROM products
       WHERE active=true AND price > 0`
    );
    const referencePrice = Number(priceResult.rows[0]?.price || 0);

    await pool.query(
      `INSERT INTO products (id,name,price,stock,active,image,note,updated_at)
       VALUES
         ('semita',' Pan estrella · Semitas',$1,0,true,
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85',
          'Pan estrella',now()),
         ('polvoron',' Pan estrella · Polvorones',$1,0,true,
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85',
          'Pan estrella',now())
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,
         active=true,
         note=EXCLUDED.note,
         updated_at=now()`,
      [referencePrice]
    );
    const catalogResult = await pool.query('SELECT id,name,price,stock,active FROM products WHERE active=true ORDER BY name');
    console.log(`MIGA catalog seed OK: Pan estrella · Semitas + Polvorones (reference price ${referencePrice})`);
    console.log('MIGA catalog order:', catalogResult.rows.map((p, index) => `${index + 1}:${p.name.trim()}`).join(' | '));
  } finally {
    await pool.end();
  }
}

if (process.argv.includes('--run')) {
  seedCatalog().catch(error => {
    console.error('MIGA catalog seed failed:', error?.stack || error);
    process.exitCode = 1;
  });
} else if (!process.env.MIGA_CATALOG_PRELOAD_CHILD) {
  try {
    execFileSync(process.execPath, [path.resolve(__filename), '--run'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '',
        MIGA_CATALOG_PRELOAD_CHILD: '1'
      }
    });
  } catch (error) {
    console.error('MIGA catalog preload failed:', error?.message || error);
  }
}
