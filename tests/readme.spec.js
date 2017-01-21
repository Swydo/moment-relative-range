/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import fs from 'fs';
import { transform } from 'babel-core';

function transformer(text) {
  return transform(text, {
    presets: [['env', {
      comments: true,
    }]],
  });
}

function makeComment(text) {
  return text.split('\n')
        .map(line => `// ${line}`)
        .join('\n');
}

function parseReadMe(readme) {
  const examples = readme.split('\n```js')
        .map((part, i) => {
          let text;

          if (i === 0) {
            text = makeComment(part);
          } else {
            const parts = part.split('\n```');
            const code = parts[0];
            const comment = makeComment(parts[1]);

            text = `${code}\n${comment}`;
          }
          return text;
        });

  return examples.join('\n// ```javascript');
}

describe('SDK README', () => {
  it('should run README', function () {
    const data = fs.readFileSync('./README.md');
    const safeReadme = parseReadMe(data.toString());
    const runnableExample = transformer(safeReadme);

    // eslint-disable-next-line no-eval
    eval(runnableExample.code);
  }, 1000);
});
