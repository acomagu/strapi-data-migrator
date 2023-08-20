# The data migrator from Strapi V3 to Strapi V3

This helps you to dump data from Strapi, transform it to fit the destination Strapi and import it.

The npm package includes the 4 commands:

- `strapi-dump-data`: Dumps all data as JSON from Strapi.
- `strapi-generate-types`: Generates TypeScript types of the data.
- `strapi-generate-transformer`: Generate a boilerplate helps you to write your own data transformer(fully typed TypeScript code).
- `strapi-import-data`: Imports a JSON data into Strapi.

## Typical Usecase: Dump data from Strapi, transform and import to another Strapi.

This example assumes that you have two Strapi projects, one is the source and the other is the destination.

```
.
├── source-strapi/
└── destination-strapi/
```

### Step 1: Dump data and generate types from the data source Strapi

First, install the npm package **at the source Strapi source code**:

```
cd source-strapi
npm install -D @acomagu/strapi-data-migrator
```

Then, dump data and generate the types:

```
npx strapi-dump-data
npx strapi-generate-types
```

`data.json` and `models.ts` will be generated.

You can export data through REST API also by adding flag like `npx strapi-dump-data --useapi <URL>`, but it's not recommended. The internal data of some plugins can't be fetched, and if the API controller is customized, this tool may not be able to find the endpoint URL correctly.

### Step 2: Generate types from the destination Strapi

**Move to the destination Strapi directory** and generates `models.ts` for destination Strapi also:

```
cd ../destination-strapi
npm install -D @acomagu/strapi-data-migrator
npx strapi-generate-types
```

### Step 3: Generate transformer

**Still in the destination Strapi directory,** execute:

```
npx strapi-generate-transformer ../data-transformer ../source-strapi/models.ts ./models.ts
```

This command creates the boilerplate at `../data-transformer`.

```
.
├── source-strapi/
├── destination-strapi/
└── data-transformer/
    ├── index.ts
    ├── sourceModels.ts
    ├── destinationModels.ts
    ├── package.json
    └── node_modules/
```

And copy `data.json` at Step 1 into it.

```
cp ../source-strapi/data.json ../data-transformer
```

### Step 4: Complete the transformer and run

The generated `index.ts` is like this:

```typescript
import fs from 'fs';
import typia from 'typia';
import * as source from './sourceModels.js';
import * as dest from './destModels.js';

type Data<T> = { [Name in keyof T]: T[Name][] };

// import data
const uncheckedData = JSON.parse((fs.readFileSync('data.json')).toString());
const data = typia.assert<Data<source.ModelByName>>(uncheckedData);

// Transform data to destination format.
// Write code to transform data here and fix all type errors.
// For example, if the destination user model has `first_name` and `last_name` fields instead of `name`:
//
// ```
//   "user": data.user.map((user) => ({
//     ...user,
//     first_name: user.name.split(' ')[0],
//     last_name: user.name.split(' ')[1],
//   })),
// ```
let transformedData: Data<dest.ModelByName> = {
  'post': data['post'],
  'user': data['user'],
  ...
};


// Save data to file as JSON to be imported to destination Strapi.
fs.writeFileSync('transformedData.json', JSON.stringify(transformedData));
```

Let's try running it.

```
cd ../data-transformer
npm start
```

If the source and destination Strapi models are different, TypeScript compile error should be present.

Fixing them is your task. Write data migration code to fit to the destination Strapi model.

If the conversion is successful, `transformedData.json` will be generated.

### Step 5: Import data to destination Strapi

During import, several data transformations are performed (mainly ID rewriting).

We recommend that you pre-check your data with `--dry-run` before actually running the import.

```
cd ../destination-strapi
cp ../transformedData.json ./data.json
npx strapi-import-data --dry-run
```

`written-data.json` are generated. If it seems OK, then actually run the import.

```
npx strapi-import-data
```

## Trouble Shooting

### Importing was succeeded, but data is not present in admin panel

Check internationalization setting. Setting up the same as source Strapi may display the data.

### Error while importing: `Cannot find new id for ...`

The entry has relation to other entry, but can't find the related entry. The relation field in which the error occurred is null, but the other fields are imported.

Correct the field mannualy after importing or correct them to the correct relation in the Transform step.

### Error while importing: `Couldn't create the item because of duplication error`

Entry could not be imported because one of the fields in the destination model schema had a unique constraint, which was violated.

### IDs of entries are changed

This is by design.
