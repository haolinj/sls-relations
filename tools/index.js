const { resolve } = require('path');
const fs = require('fs');
const fp = require('lodash/fp');


/**
 * Scan files in a folder with specified level of deepness. 
 * This is modified from @see https://gist.github.com/qwtel/fd82ab097cbe1db50ded9505f183ccb8 
 * Thanks to https://gist.github.com/qwtel, awesome snippet.
 */
const getFiles = (dir, deep, level) => {
  const subdirs = fs.readdirSync(dir);
  const files = fp.flow(
    fp.map(subdir => {
      const res = resolve(dir, subdir);
      if (level > deep) {
        return (fs.statSync(res)).isDirectory() ? undefined : res;
      }
      else {
        const nextLevel = level + 1;
        return (fs.statSync(res)).isDirectory() ? getFiles(res, deep, nextLevel) : res;
      }
    }),
    fp.compact
  )(subdirs);
  return fp.reduce((res, f) => res.concat(f))([])(files);
};

const extractServerlessFiles = () => {
  const args = process.argv;
  if (args.length < 5) {
    console.log('Require args [path] [output] [deep].');
    return;
  }

  const path = args[2];
  const output = args[3];
  const deep = args[4];

  if (path[0] !== '/' || output[0] !== '/') {
    console.log('Require absolute path for both [path] and [output].');
    return;
  }

  console.log(`Scanning [${path}] with deep [${deep}].`);

  const files = getFiles(path, deep, 1);
  const serverlessFiles = fp.filter(f => fp.includes('serverless.yml')(f))(files);

  console.log('Found serverless files.');
  console.log(serverlessFiles);

  fp.forEach(file => {
    const parts = file.split('/');
    const fileName = fp.last(parts);
    const serviceName = parts[parts.length - 2];

    fs.copyFileSync(file, `${output}/${serviceName}-${fileName}`);
  })(serverlessFiles);

  console.log(`All serverless.yml files are extract and copied to [${output}].`);
};

extractServerlessFiles();