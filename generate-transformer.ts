#!/usr/bin/env node
import ts from 'ts-morph';
import { models } from './strapi-settings.js';
import { destroy } from './strapi.js';
import fs from 'fs/promises';
import { $, cd, within } from 'zx';
import path from 'node:path';
import chalk from 'chalk';

const [, , arg0, arg1, arg2] = process.argv;
if (!arg0) console.log('Project directory path is not provided. Using "./data-migrator" as default.');
const projectDirectoryPath = path.resolve(arg0 ?? './data-migrator');
const sourceModelsFileName = arg1;
const destModelsFileName = arg2;
console.log('argv', process.argv);

const project = new ts.Project();

createIndexTs();
await checkProjectDirectory();
await createPackageJson();
await createSourceModels();
await createTsConfig();
await project.save();
await executeNpmInstall();

destroy();

async function checkProjectDirectory() {
  try {
    await fs.stat(projectDirectoryPath);
  } catch {
    await fs.mkdir(projectDirectoryPath);
  }

  if ((await fs.readdir(projectDirectoryPath)).length > 0) {
    console.error('Project directory is not empty.');
    process.exit(1);
  }
}


async function executeNpmInstall() {
  within(async () => {
    cd(projectDirectoryPath);
    console.log('Executing npm install...');
    $`npm i`;
  });
}

async function createSourceModels() {
  within(async () => {
    cd(projectDirectoryPath);
    if (sourceModelsFileName) {
      $`cp ${sourceModelsFileName} sourceModels.ts`;
    } else {
      console.warn();
      console.warn(chalk.yellow('No source models file provided. Please create the file by executing'));
      console.warn(chalk.yellow(`following command ${chalk.bold('in the source Strapi project')}:`));
      console.warn(chalk.yellow('  $ npm i -D @acomagu/strapi-data-migrator'));
      console.warn(chalk.yellow('  $ npx strapi-generate-types'));
      console.warn(chalk.yellow('And copy it:'));
      console.warn(chalk.yellow(`  $ cp models.ts ${projectDirectoryPath}/sourceModels.ts`));
    }
    if (destModelsFileName) {
      $`cp ${destModelsFileName} destinationModels.ts`;
    } else {
      console.warn();
      console.warn(chalk.yellow('No destination models file provided. Please create the file by executing'));
      console.warn(chalk.yellow(`following command ${chalk.bold('in the destination Strapi project')}:`));
      console.warn(chalk.yellow('  $ npm i -D @acomagu/strapi-data-migrator'));
      console.warn(chalk.yellow('  $ npx strapi-generate-types'));
      console.warn(chalk.yellow('And copy it:'));
      console.warn(chalk.yellow(`  $ cp models.ts ${projectDirectoryPath}/destinationModels.ts`));
    }
    console.warn();
  });
}

async function createTsConfig() {
  const content = {
    compilerOptions: {
      downlevelIteration: true,
      emitDecoratorMetadata: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      skipLibCheck: true,
      lib: ['es2023'],
      module: 'esnext',
      moduleResolution: 'node16',
      noImplicitReturns: true,
      noUncheckedIndexedAccess: true,
      noUnusedLocals: true,
      strict: true,
      target: 'es2022',
    },
    include: ['.'],
    exclude: [
      'cdk.out',
      '**/*.d.ts',
    ],
  };

  await fs.writeFile(`${projectDirectoryPath}/tsconfig.json`, JSON.stringify(content, null, 2));
}

async function createPackageJson() {
  const content = {
    name: 'strapi-data-migrator',
    version: '0.0.0',
    main: 'index.js',
    scripts: {
      prepare: 'ts-patch install',
      start: 'ts-node index.ts',
    },
    dependencies: {
      typia: '^4.1.16',
    },
    devDependencies: {
      'ts-node': '^10.9.1',
      'ts-patch': '^3.0.2',
      typescript: '^5.1.6',
    },
  };

  await fs.writeFile(`${projectDirectoryPath}/package.json`, JSON.stringify(content, null, 2));
}

function createIndexTs() {
  const sf = project.createSourceFile(`${projectDirectoryPath}/index.ts`, '');

  sf.addStatements(`
import fs from 'fs/promises';
import typia from 'typia';
import * as source from './sourceModels.js';
import * as destination from './destinationModels.js';

type Data<T> = { [Name in keyof T]: T[Name][] };

// import data
const uncheckedData = JSON.parse((await fs.readFile('data.json')).toString());
const data = typia.assert<Data<source.ModelByName>>(uncheckedData);

// Transform data to destination format.
// Write code to transform data here and fix all type errors.
// For example, if the destination user model has \`first_name\` and \`last_name\` fields instead of \`name\`:
//
// \`\`\`
//   "user": data.user.map((user) => ({
//     ...user,
//     first_name: user.name.split(' ')[0],
//     last_name: user.name.split(' ')[1],
//   })),
// \`\`\`
`.trimStart());

  sf.addVariableStatements([{
    declarations: [{
      name: 'transformedData',
      type: 'Data<destination.ModelByName>',
      initializer: ts.Writers.object(Object.fromEntries(Object.keys(models).map(name => [`'${name}'`, `data['${name}']`]))),
    }],
  }]);

  sf.addStatements(`
// Save data to file as JSON to be imported to destination Strapi.
await fs.writeFile('transformedData.json', JSON.stringify(transformedData));
`);

  sf.formatText({ indentSize: 2 });
}
