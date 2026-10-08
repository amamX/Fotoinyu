const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      if (p.endsWith('.jsx') || p.endsWith('.css')) callback(p);
    }
  });
}

walk(dir, (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace CSS variables
  content = content.replace(/--color-brand-coral/g, '--color-primary');
  content = content.replace(/--color-brand-maroon/g, '--color-primary-dark');
  content = content.replace(/--color-brand-pink/g, '--color-accent');
  content = content.replace(/--color-brand-black/g, '--color-neutral-900');
  
  // Replace Tailwind pink/rose classes
  content = content.replace(/bg-pink-50/g, 'bg-slate-50');
  content = content.replace(/bg-pink-100/g, 'bg-blue-50');
  content = content.replace(/border-pink-50/g, 'border-slate-100');
  content = content.replace(/border-pink-200/g, 'border-blue-200');
  content = content.replace(/text-pink-400/g, 'text-blue-400');
  content = content.replace(/text-rose-500/g, 'text-blue-500');
  content = content.replace(/bg-rose-50/g, 'bg-blue-50');
  content = content.replace(/bg-rose-100/g, 'bg-blue-100');
  content = content.replace(/shadow-rose-200/g, 'shadow-blue-200');
  content = content.replace(/bg-rose-500\/30/g, 'bg-blue-500/30');
  content = content.replace(/bg-pink-500\/20/g, 'bg-cyan-500/20');
  content = content.replace(/hover:bg-rose-600/g, 'hover:bg-blue-700');
  content = content.replace(/text-rose-100/g, 'text-blue-100');
  content = content.replace(/bg-rose-950/g, 'bg-slate-900');
  content = content.replace(/hover:border-pink-900/g, 'hover:border-blue-900');
  content = content.replace(/hover:border-pink-400/g, 'hover:border-blue-400');
  content = content.replace(/hover:text-pink-400/g, 'hover:text-blue-400');
  
  // Replace specific hardcoded colors in Packages.jsx / Booking.jsx
  content = content.replace(/#d946ef/g, '#3b82f6'); // blue-500
  content = content.replace(/#f43f5e/g, '#2563eb'); // blue-600
  content = content.replace(/#881337/g, '#1e40af'); // blue-800
  content = content.replace(/#fdf2f8/g, '#f8fafc'); // slate-50

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
