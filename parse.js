const fs = require('fs');

const vercelPath = '/Users/a374590/.gemini/antigravity-ide/brain/8b80950a-73b9-48da-a392-c52d9a4c3503/.system_generated/steps/61/content.md';
const html = fs.readFileSync(vercelPath, 'utf8');

const heroStart = html.indexOf('<section class="HeroSearchFirst_hero__lP084"');
const heroEnd = html.indexOf('</section>', heroStart);

if (heroStart !== -1 && heroEnd !== -1) {
  const heroHtml = html.substring(heroStart, heroEnd + 10);
  // Let's replace class hashes so it's clean and easy to read
  const cleanHtml = heroHtml
    .replace(/HeroSearchFirst_([a-zA-Z0-9]+)__[a-zA-Z0-9_]+/g, '$1')
    .replace(/style="[^"]*"/g, '');
  
  fs.writeFileSync('hero_structure.html', cleanHtml);
  console.log("Saved clean hero structure to hero_structure.html");
} else {
  console.log("Could not find Hero section start/end");
}
