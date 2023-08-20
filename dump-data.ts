#!/usr/bin/env node
import pluralize from 'pluralize';
import { ModelSetting, models, components, ComponentSetting } from './strapi-settings.js';
import fs from 'fs/promises';
import { destroy } from './strapi.js';

interface Item {
  [key: string]: unknown;
}

const useApiIndex = process.argv.indexOf('--useapi');

let data: Record<string, Item[]>;
if (useApiIndex === -1) {
  data = Object.fromEntries((await Promise.all(Object.entries(models).map(async ([name, model]) => {
    console.log('fetching', name);
    const data = await strapi.query(name, model.plugin!).find({ _limit: -1 });
    if (!Array.isArray(data)) {
      console.error('not array:', data);
      return [];
    }
    return [[name, data]];
  }))).flat());
} else {
  const apiUrl = process.argv[useApiIndex + 1];
  data = Object.fromEntries((await Promise.all(Object.entries(models).map(async ([name, model]) => {
    const path = model.kind === 'singleType' ? name : pluralize(name);
    const resp = await fetch(`${apiUrl}/${path}`);
    const body = await resp.text();
    let data: Item[];
    try {
      if (model.kind === 'singleType') {
        data = [JSON.parse(body)];
      } else {
        data = JSON.parse(body);
      }
    } catch {
      console.error(path, body);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error(path, data);
      return [];
    }
    return [[name, data]] as const;
  }))).flat());
}

const newData = Object.fromEntries(Object.entries(data).map(([name, data]) => {
  const newData = data.map((item: Item) => omitRelationContents(models[name]!, item));

  return [name, newData] as const;
}));

function omitRelationContents(model: ModelSetting | ComponentSetting, item: Item): Item {
  return Object.fromEntries(Object.entries(item).flatMap(([key, value]) => {
    const config = model.attributes[key];
    if (!config) return [[key, value]];
    if (config.writable === false) return [];
    if ('model' in config) {
      if (item[key] === null) return [[key, null]];
      if (typeof value !== 'object' || !value || !('id' in value)) throw new Error(`Expected object but got ${JSON.stringify(value)}`);
      return [[key, value.id]];
    }
    if ('collection' in config) {
      if (item[key] === null) return [[key, null]];
      if (!Array.isArray(value)) throw new Error(`Expected array but got ${typeof value}`);
      return [[key, value.map((v: { id: string }) => v.id)]];
    }
    if (config.type === 'component') {
      if (item[key] === null) return [[key, null]];
      if (config.repeatable) {
        if (!Array.isArray(value)) throw new Error(`Expected array but got ${typeof value}`);
        const componentSetting = components[config.component];
        if (!componentSetting) throw new Error('component not found: ' + config.component);
        return [[key, value.map((item: Record<string, unknown>) => Object.fromEntries(Object.entries(omitRelationContents(componentSetting, item as Item)).filter(([k]) => k !== 'id')))]];
      } else {
        if (typeof value !== 'object' || !value) throw new Error(`Expected object but got ${JSON.stringify(value)}`);
        const componentSetting = components[config.component];
        if (!componentSetting) throw new Error('component not found: ' + config.component);
        return [[key, Object.fromEntries(Object.entries(omitRelationContents(componentSetting, value as Item)).filter(([k]) => k !== 'id'))]];
      }
    }
    return [[key, item[key]]];
  }))
}

await fs.writeFile('./data.json', JSON.stringify(newData));

destroy();
