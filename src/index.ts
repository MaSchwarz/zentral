export type PropertyType = string | number | boolean;

export type PropertyTypeName<T extends PropertyType> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  never;

export type Property<T extends PropertyType> = {
  type: PropertyTypeName<T>
  default?: T,
};

export type Config = {
  [key: string]: Property<PropertyType> | Config
};

export type Environment<T extends Config> = {
  [Key in keyof T]:
    T[Key] extends Property<PropertyType> ? Required<T[Key]["default"]> :
    T[Key] extends Config ? Environment<T[Key]> : never
};

export type ErrorKind = "";
export type Error = { kind: ErrorKind, message?: string };
export type Result<T> = ({ success: true, data: T } | { success: false, errors: Error[] });

function parseString(value?: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim();
  }

  return undefined;
}

function parseNumber(value?: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return parseFloat(value.trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function parseBoolean(value?: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 0 ? false : value === 1 ? true : undefined;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true" ? true :
      value.trim().toLowerCase() === "false" ? false :
      undefined;
  }

  return undefined;
}

function parse<T extends PropertyType>(type: PropertyTypeName<T>, value?: unknown): T | undefined;
function parse<T extends PropertyType>(type: PropertyTypeName<T>, value?: unknown): PropertyType | undefined {
  switch(type) {
    case "string":
      return parseString(value);
    case "number":
      return parseNumber(value);
    case "boolean":
      return parseBoolean(value);
  }
}

function getValue<T extends Property<PropertyType>>(property: T, path: string): T["default"];
function getValue<T extends Property<PropertyType>>(property: T, path: string): PropertyType {
  const variable = path.replace(".", "_").toUpperCase();
  const value = parse(property.type, process.env[variable]);

  if (value) {
    return value;
  }

  if (property.default) {
    return property.default;
  }

  throw new Error(`Failed to read '${variable}'. Make sure the variable exists and can be parsed to a ${property.type}`);
}

function resolveLayer<T extends Config>(config: T, path?: string): Environment<T>;
function resolveLayer<T extends Config>(config: T, path?: string): any {
  const temp: any = { }

  for (const key in config) {
    const updatedPath = (path || "") + ((path?.length || 0) <= 0 ? "" : ".") + key;

    if (config[key]["type"]) {
      temp[key] = getValue(config[key] as any, updatedPath);
    } else {
      temp[key] = resolveLayer(config[key] as any, updatedPath);
    }
  }

  return temp;
}

function config<T extends Config>(config: T): Environment<T>;
function config<T extends Config>(config: T): any {
  return resolveLayer(config);
}

export default {
  config,
};
