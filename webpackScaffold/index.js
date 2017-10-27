#!/usr/bin/env node
const program = require('commander');
const path = require('path')
const fs = require('fs-extra');
const cwd = path.resolve(process.cwd());
const configDir = path.resolve(__dirname, 'projects');
const baseDir = path.resolve(__dirname, 'base');

const PROJECTS = {
  "react": '',
  "angular": '',
  "angularjs": '',
  "basic": ''
}

program
  .arguments('<project-type>')
  .action(function(type) {
    projectType = type.toLowerCase();
  })
  .parse(process.argv);

if (typeof projectType === 'undefined') {
  program.outputHelp();
  process.exit(1);
} 

try {
  fs.copySync(baseDir, cwd);

  const projectDir = `${configDir}/${projectType}`;
  if(!fs.existsSync(projectDir)) {
    console.log('Unknown project type. Scaffolding a basic project instead\n');
    console.log('Done.');
    process.exit(1);
  }
  console.log(`Scaffolding a new ${projectType} project...\n`);
  const projectFiles = walk(projectDir);

  projectFiles.forEach(file => {
    const baseFile = `${baseDir}/${file}`;
    const projectConfigFile = `${projectDir}/${file}`;
    if (fs.existsSync(baseFile)) {
      try {
        const configFile = JSON.parse(fs.readFileSync(baseFile, 'utf-8'));
        const projectConfig = JSON.parse(
          fs.readFileSync(projectConfigFile, 'utf-8'));
        const merged = mergeObjects([configFile, projectConfig]);

        fs.writeFile(
          `${cwd}/${file}`, JSON.stringify(merged, null, '  '), err => {
            if(err)
              return console.log(err);
        }); 
      } catch(err) {
        fs.copy(`${projectDir}/${file}`, `${cwd}/${file}`)
          .catch(err => {
            console.error(err);
            process.exit(1);
          })
      }
    } else {
      fs.copy(`${projectDir}/${file}`, `${cwd}/${file}`)
        .catch(err => {
          console.error(err);
          process.exit(1);
        })
    }
  });
  console.log('Done.');
} catch(err) {
  console.error(err);
  process.exit(1);
}

function mergeObjects(objects, cb) {
  const r = {}
  objects.forEach(obj => {
    Object.keys(obj).forEach(key => {
      if(!r[key] || typeof r[key] !== 'object' || 
        (typeof r[key] === 'object' && typeof obj[key] !== 'object')) {
          r[key] = obj[key];
      } else {
        if((r[key] instanceof Array && !(obj[key] instanceof Array)) ||
          (!(r[key] instanceof Array) && obj[key] instanceof Array)) {
            r[key] = obj[key];
        } else if(obj[key] instanceof Array) {
          r[key] = r[key].concat(obj[key]);
        } else {
          r[key] = mergeObjects([r[key], obj[key]]);
        }
      }

    });
  });
  return r
}

function walk(root, dir) {
  let path = root;
  if(dir)
    path = `${root}/${dir}`;

  let results = [];
  let list = fs.readdirSync(path);
  list.forEach(file => {
    if(dir)
      file = `${dir}/${file}`;

    let filePath = `${root}/${file}`;
    let stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) 
      results = results.concat(walk(root, file));
    else 
      results.push(file);
  });
  return results;
}
