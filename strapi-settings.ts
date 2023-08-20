import './strapi.js';

// Models
// const models: { setting: ModelSetting, name: string, path: string }[] = [];
// for await (const entry of globIterate(`${process.argv[0]}/api/*/models/*.settings.json`)) {
//   models.push({
//     setting: JSON.parse(await fs.readFile(entry, 'utf8')),
//     name: entry.split(path.sep).at(-3) ?? '',
//     path: entry,
//   });
// }
//
// Components
// interface Component { setting: ComponentSetting, group: string, name: string, path: string }
//
// const components: Component[] = [];
//
// for await (const entry of globIterate(`${process.argv[0]}/components/*/*.json`)) {
//   const p = path.parse(entry);
//   components.push({
//     setting: JSON.parse(await fs.readFile(entry, 'utf8')),
//     group: path.basename(p.dir),
//     name: p.name,
//     path: entry,
//   });
// }
//
//
export interface AttributesSetting {
  readonly [key: string]: ({
    readonly type: 'datetime';
  } | {
    readonly type: 'string';
    readonly regex?: string;
  } | {
    readonly type: 'component';
    readonly repeatable: boolean;
    readonly component: string;
  } | {
    readonly type: 'richtext';
  } | {
    readonly type: 'text';
  } | {
    readonly type: 'integer';
    readonly min: number;
    readonly max: number;
  } | {
    readonly type: 'float';
    readonly min: number;
    readonly max: number;
  } | {
    readonly type: 'boolean';
    readonly default: boolean;
  } | {
    readonly type: 'enumeration';
    readonly enum: readonly string[];
    readonly default?: string;
  } | {
    readonly type: 'json';
  } | {
    readonly type: 'email';
  } | {
    readonly type: 'decimal';
  } | {
    readonly type: 'password';
  } | {
    readonly model: string;
    readonly via?: string;
    readonly allowedTypes?: readonly string[];
    readonly plugin?: string;
  } | {
    readonly collection: string;
    readonly via?: string;
    readonly allowedTypes?: readonly string[];
    readonly plugin?: string;
  }) & {
    readonly required?: boolean;
    readonly pluginOptions?: {
      readonly i18n: {
        readonly localized: boolean;
      };
    };
    readonly unique?: boolean;
    readonly configurable?: boolean;
    readonly writable?: boolean;
    readonly visible?: boolean;
    readonly private?: boolean;
  }
}

export interface ModelSetting {
  readonly kind: 'collectionType' | 'singleType';
  readonly collectionName: string;
  readonly info: {
    readonly name: string;
    readonly description?: string;
    readonly mainField?: string;
  };
  options: {
    readonly increments: boolean;
    readonly timestamps: string[];
    readonly draftAndPublish: boolean;
  };
  readonly pluginOptions?: {
    readonly i18n?: {
      readonly localized: boolean;
    };
  };
  readonly plugin?: string;
  readonly attributes: AttributesSetting;
  readonly uid: string;
  readonly apiName: string;
  readonly globalId: string;
  readonly modelType: string;
  readonly modelName: string;
  readonly connection: string;
  readonly globalName: string;
  readonly associations: {
    readonly alias: string;
    readonly type: 'collection' | 'model';
    readonly targetUid: string;
    readonly collection?: string;
    readonly nature: 'manyWay' | 'oneWay' | 'manyToOne' | 'oneToMany' | 'oneToOne' | 'manyToManyMorph' | 'manyToMany' | 'oneToManyMorph' | 'manyMorphToMany';
    readonly autoPopulate: boolean;
    readonly dominant?: boolean;
    readonly populate?: string[];
    readonly tableCollectionName?: string;
    readonly model?: string;
    readonly plugin?: string;
    readonly via?: string;
    readonly filter?: string;
    readonly related?: ModelSetting[];
  }[];
  readonly orm: string;
  readonly databaseName: string;
  readonly client: string;
  readonly primaryKey: string;
  readonly primaryKeyType: string;
  readonly allAttributes: AttributesSetting;

  // Below are only in strapi.model but not .setting.json file.
  // associations: ({
  //   type: 'collection' | 'model';
  //   model?: 'user';
  //   related?: Array<any>; // Consider replacing `any` with the specific type
  //   nature: 'manyWay';
  //   autoPopulate: boolean;
  //   dominant?: boolean;
  //   plugin?: 'admin';
  //   via?: undefined;
  //   filter?: 'field' | undefined;
  //   populate?: undefined;
  // } | {
  //   alias: string;
  //   targetUid: string;
  //   type: 'collection' | 'model';
  //   model?: 'user';
  //   related?: Array<any>; // Consider replacing `any` with the specific type
  //   nature: 'manyMorphToMany' | 'oneWay';
  //   autoPopulate: boolean;
  //   dominant?: boolean;
  //   plugin?: 'admin';
  //   via?: undefined;
  //   filter?: 'field' | undefined;
  //   populate?: undefined;
  // })[];
}

export interface ComponentSetting {
  readonly collectionName: string;
  readonly info: {
    readonly name: string;
    readonly icon: string;
    readonly description?: string;
  };
  readonly attributes: AttributesSetting;
}

export let models: { [name: string]: ModelSetting } = (strapi as any).models;
for (const pluginSetting of Object.values((strapi as any).plugins)) {
  models = { ...models, ...(pluginSetting as any).models };
}

export const components: { [name: string]: ComponentSetting } = (strapi as any).components;
