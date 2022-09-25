# Senf - TypeScript-first env configuration

Senf is a TypeScript-first module that combines the convenience of environment variables with the confidence of file based configs.

Never worry about missing environment variables or accidental typos in `process.env[...]` calls ever again.

## Install
```bash
# install locally (recommended)
npm install senf --save
```

## Usage

Create a config file somewhere in your project that contains the desired schema:

```typescript
// src/config.ts
import senf from "senf";

const schema: senf.Config = {
  hello: {
    type: "string",
    default: "my-default"
  },
  world: {
    nested: {
      type: "number"
    }
  }
};

const config = senf.config(schema);

export default config;
```

That's it! Now you can import your `src/config.ts` module anywhere in your code and access all config properties with full autocompletion.


## How does it work?

All schema properties get converted to the corresponding environment variables (`hello` => `HELLO`, `world.nested` => `WORLD_NESTED`).
If the environment variable exists, it gets parsed to the defined type, but if it doesn't the default value is chosen.
If the default value is also missing (or the parsing fails) an error is thrown.
