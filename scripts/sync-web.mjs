/* Copy static web assets into www/ for Capacitor packaging */
import { cpSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

for (const item of ['index.html', 'css', 'js', 'assets', 'manifest.webmanifest', 'sw.js']) {
  cpSync(join(root, item), join(www, item), { recursive: true });
}

console.log('✓ www/ synced — ready for capacitor');
