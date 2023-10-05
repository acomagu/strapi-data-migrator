#!/usr/bin/env node
import ts from 'ts-morph';
import { pascalCase } from 'change-case';
import { models, components, AttributesSetting } from './strapi-settings.js';
import { destroy } from './strapi.js';

const isReadonly = process.argv.includes('--immutable-types');

const project = new ts.Project();
const sf = project.createSourceFile('models.ts', '', { overwrite: true });

for (const [name, modelSetting] of Object.entries(models)) {
  if (modelSetting.primaryKeyType !== 'integer') throw new Error(`Unsupported primary key type: ${modelSetting.primaryKeyType}`);
  sf.addInterface({
    name: modelInterfaceName(name),
    isExported: true,
    properties: [
      {
        name: modelSetting.primaryKey,
        type: 'number',
        isReadonly,
      },
      ...interfacePropertiesFromAttributesSetting(modelSetting.attributes),
    ],
  });
}

sf.addTypeAlias({
  name: 'Model',
  isExported: true,
  type: Object.keys(models).map(name => modelInterfaceName(name)).join(' | '),
});

sf.addInterface({
  isExported: true,
  properties: Object.entries(models).map(([name]) => ({ name: `'${name}'`, type: modelInterfaceName(name), isReadonly })),
  name: 'ModelByName',
});

for (const [name, setting] of Object.entries(components)) {
  sf.addInterface({
    name: componentInterfaceName(name),
    isExported: true,
    properties: interfacePropertiesFromAttributesSetting(setting.attributes),
  });
}

sf.addTypeAlias({
  name: 'Component',
  isExported: true,
  type: Object.keys(components).map(name => componentInterfaceName(name)).join(' | '),
});

sf.formatText({ indentSize: 2 });
sf.save();

console.log(`${Object.keys(models).length} models and ${Object.keys(components).length} components are imported and saved to models.ts.`);

destroy();

function modelInterfaceName(name: string) {
  return pascalCase(name);
}

function componentInterfaceName(component: string) {
  return `${pascalCase(component)}Component`;
}

function interfacePropertiesFromAttributesSetting(attributes: AttributesSetting) {
  return Object.entries(attributes).flatMap(([name, attr]) => {
    if (attr.writable === false) return [];
    const isOptional = attr.required == undefined ? true : !attr.required;
    const base = {
      name,
      hasQuestionToken: isOptional,
      isReadonly,
    } as const;
    const optionalTypeSuffix = isOptional ? ' | null' : '';
    if ('type' in attr) {
      switch (attr.type) {
        case 'text':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
        case 'string':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
        case 'richtext':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
        case 'integer':
          return [{ ...base, type: 'number' + optionalTypeSuffix }];
        case 'float':
          return [{ ...base, type: 'number' + optionalTypeSuffix }];
        case 'boolean':
          return [{ ...base, type: 'boolean' + optionalTypeSuffix }];
        case 'datetime':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
        case 'json':
          return [{ ...base, type: 'unknown' + optionalTypeSuffix }];
        case 'email':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
        case 'enumeration':
          return [{ ...base, type: attr.enum.map(value => `'${value}'`).join(' | ') + optionalTypeSuffix }];
        case 'component':
          return [{
            ...base,
            hasQuestionToken: attr.repeatable ? false : isOptional, // For repeatable component field, at least empty array is necessary.
            type: attr.repeatable ? `${isReadonly ? 'readonly ' : ''}${componentInterfaceName(attr.component)}[]` : (componentInterfaceName(attr.component) + optionalTypeSuffix),
          }];
        case 'decimal':
          return [{ ...base, type: 'number' + optionalTypeSuffix }];
        case 'password':
          return [{ ...base, type: 'string' + optionalTypeSuffix }];
      }
    }
    if ('model' in attr) {
      // return [{ ...base, type: modelInterfaceName(attr.model) + optionalTypeSuffix }];
      return [{ ...base, type: 'number' + optionalTypeSuffix }];
    }
    if ('collection' in attr) {
      // return [{ ...base, type: attr.collection === '*' ? 'any' : modelInterfaceName(attr.collection) + optionalTypeSuffix }];
      return [{ ...base, type: `${isReadonly ? 'readonly ' : ''}number[]` + optionalTypeSuffix }];
    }
    throw new Error(`Unknown attribute type: ${JSON.stringify(attr)}`);
  })
}
