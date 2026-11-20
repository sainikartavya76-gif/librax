const fs = require('fs');
const esbuild = require('C:/Users/Ajay saini/.gemini/antigravity/scratch/librax/frontend/node_modules/esbuild');

const html = fs.readFileSync('C:/Users/Ajay saini/.gemini/antigravity/scratch/librax/standalone/index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (!scriptMatch) {
  console.error('No script tag found!');
  process.exit(1);
}

const rawJsx = scriptMatch[1];

try {
  const transformed = esbuild.transformSync(rawJsx, {
    loader: 'jsx',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2020'
  });

  console.log('esbuild JSX transform SUCCESS! Pure JS size:', transformed.code.length);

  // Now replace the <script src="...babel.min.js"></script> and <script type="text/babel"> with pure <script>
  let cleanHtml = html;
  
  // Remove Babel CDN script tag
  cleanHtml = cleanHtml.replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>\s*/, '');
  
  // Replace <script type="text/babel">...</script> with <script>pureJs</script>
  cleanHtml = cleanHtml.replace(
    /<script type="text\/babel">[\s\S]*?<\/script>/,
    `<script>\n${transformed.code}\n</script>`
  );

  fs.writeFileSync('C:/Users/Ajay saini/.gemini/antigravity/scratch/librax/standalone/index.html', cleanHtml, 'utf8');
  console.log('standalone/index.html updated successfully with Pure Vanilla JS!');

} catch (e) {
  console.error('esbuild transform error:', e);
  process.exit(1);
}
