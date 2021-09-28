const path = require('path');

module.exports = {
  '{src}/**/*.ts': files => {
    const cwd = process.cwd();
    const filesList = files.map(file => path.relative(cwd, file)).join(',');
    return [`eslint --fix --files=${filesList}`, `git add ${files.join(' ')}`];
  },
};
