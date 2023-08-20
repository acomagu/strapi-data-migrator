#!/usr/bin/env node
import { destroy } from './strapi.js';
import fs from 'fs/promises';
import { ModelByName, Model, Component } from './example-models.js';
import { AttributesSetting, components, ComponentSetting, models, ModelSetting } from './strapi-settings.js';

const dryRun = process.argv.includes('--dry-run');

type ModelsByName = {
  [Name in keyof ModelByName]: ModelByName[Name][];
};

const data: ModelsByName = JSON.parse((await fs.readFile('./data.json')).toString());

const modelNames: (keyof typeof data)[] = Object.keys(data) as any;

const idMaps: Record<string, Record<number, number>> = {};

for (const name of modelNames) {
  console.log(name);
  const model = models[name];
  if (!model) throw new Error(`Model not found: ${name}`);

  const idMap: Record<number, number> = {};
  for (const item of data[name]) {
    const itemWithoutRelation = omitRelationFields(model, item);
    try {
      let newId = item.id;
      if (!dryRun) ({ id: newId } = await strapi.query(name, models[name]?.plugin!).create(itemWithoutRelation));
      idMap[item.id] = newId;
    } catch (e) {
      if (e instanceof Error && e.message === 'Duplicate entry') {
        let dupItem: any;
        for (const [attrName, attr] of Object.entries(models[name]?.attributes ?? {})) {
          if (!attr.unique) continue;

          dupItem = await strapi.query(name, models[name]?.plugin!).findOne({ [attrName]: (itemWithoutRelation as Record<string, unknown>)[attrName] });
          if (!dupItem) continue;
        }

        console.warn(`Couldn't create the item because of duplication error: ${JSON.stringify(itemWithoutRelation)}. Use the existing item for the relations of others: ${JSON.stringify(dupItem)}`);
        idMap[item.id] = dupItem.id;
      } else {
        console.error('Error:', e);
        console.error(`While creating: ${JSON.stringify(itemWithoutRelation)}`);
      }
    }
  }

  console.log('idMap:', idMap);
  idMaps[name] = idMap;
}

// fill relation fields
const mm: Record<string, Record<number, unknown>> = {};
for (const name of modelNames) {
  console.log(name);
  const m: Record<number, unknown> = {};
  for (const item of data[name]) {
    const newId = idMaps[name]?.[item.id];
    if (!newId) {
      console.error(`Cannot find new id for ${name} ${item.id}`);
      continue;
    }

    const model = models[name];
    if (!model) throw new Error(`Model not found: ${name}`);
    const newItem = fillRelationFields(model, item);
    if (name === 'role' || name === 'permission') {
      console.log('Writing:', newItem);
    }
    m[newId] = newItem;

    try {
      if (!dryRun) await strapi.query(name, models[name]?.plugin!).update({ id: newId }, newItem);
    } catch (e) {
      console.error('Error:', e);
      console.error(`While updating #${newId}: ${JSON.stringify(newItem)}`);
    }
  }
  mm[name] = m;
}

await fs.writeFile('./written-data.json', JSON.stringify(mm));

destroy();

function omitRelationFields(model: ModelSetting | ComponentSetting, item: Model | Component): Partial<Model | Component> {
  return mapItemFields(model, item, (value, attr, attrName) => {
    if (attrName === 'id') return undefined;

    if ('model' in attr || 'collection' in attr) return undefined;
    return value;
  });
}

function fillRelationFields(model: ModelSetting | ComponentSetting, item: Model | Component): Partial<Model | Component> {
  return mapItemFields(model, item, (attr, attrSetting) => {
    if (attr == null) return attr;

    if ('model' in attrSetting) {
      const newId = idMaps[attrSetting.model]?.[attr];
      if (!newId) console.error(`Cannot find new id for ${attrSetting.model} ${attr}`, idMaps[attrSetting.model]);
      return newId;
    }
    if ('collection' in attrSetting) {
      const newIds = attr.map((id: number) => {
        const newId = idMaps[attrSetting.collection]?.[id];
        if (!newId) console.error(`Cannot find new id for ${attrSetting.collection} ${id}`, idMaps[attrSetting.collection]);
        return newId;
      });
      return newIds;
    }

    return attr;
  });
}

function mapItemFields(model: ModelSetting | ComponentSetting, item: Model | Component, f: (attr: any, attrSetting: AttributesSetting[string], attrName: string) => unknown): Partial<Model | Component> {
  return Object.fromEntries(Object.entries(model.attributes ?? {}).flatMap(([attrName, attrSetting]) => {
    const attr = (item as Record<string, any>)[attrName];

    if ('type' in attrSetting && attrSetting.type === 'component') {
      console.log('component', attrName, attrSetting, attr);
      if (attr == null) return [[attrName, attr]];
      if (attrSetting.repeatable) {
        if (!Array.isArray(attr)) throw new Error(`Expected array but got ${typeof attr}`);
        const componentSetting = components[attrSetting.component];
        if (!componentSetting) throw new Error(`component not found: ${attrSetting.component}`);
        return [[attrName, attr.map((item: Record<string, unknown>) => mapItemFields(componentSetting, item, f))]];
      } else {
        if (typeof attr !== 'object' || !attr) throw new Error(`Expected object but got ${JSON.stringify(attr)}`);
        const componentSetting = components[attrSetting.component];
        if (!componentSetting) throw new Error(`component not found: ${attrSetting.component}`);
        return [[attrName, mapItemFields(componentSetting, attr, f)]];
      }
    }

    const newAttr = f(attr, attrSetting, attrName);
    if (newAttr === undefined) return [];
    return [[attrName, newAttr]];
  }));
}
