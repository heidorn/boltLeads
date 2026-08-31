const { execSync } = require('child_process');

// Get git hash with fallback
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'no-git-info';
  }
};

let commitJson = {
  hash: JSON.stringify(getGitHash()),
  version: JSON.stringify(process.env.npm_package_version),
};

// Laranja Chama (#F2552C) em truecolor; degrada para laranja 256 onde não houver.
const chama = (text) => `\x1b[38;2;242;85;44m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

console.log(`
${chama('/')} L E A D S   P E R   H O U R
  ${dim('Studio — da ideia ao produto')}
`);
console.log(dim('  versão      '), `v${commitJson.version}`);
console.log(dim('  commit      '), commitJson.hash);
console.log(dim('  aguarde o endereço local aparecer abaixo'));
console.log('');
