const TOKENS = {
  ARROW: '=>',
  OPEN_BRACKET: '[',
  CLOSE_BRACKET: ']',
  NULL_KEYWORD: 'null',
  TRUE_KEYWORD: 'true',
  FALSE_KEYWORD: 'false',
  NAN_KEYWORD: 'NAN',
  INF_KEYWORD: 'INF',
  COMMA: ','
};

const INDENT = {
  TWO_SPACES: '  ',
  FOUR_SPACES: '    ',
  TAB: '\t',
  NONE: ''
};

const QUOTE = {
  SIMPLE: "'",
  DOUBLE: '"'
};

type Options = {
  pretty: boolean,
  indent: typeof INDENT[keyof typeof INDENT],
  quote: typeof QUOTE[keyof typeof QUOTE],
  trailingComma: boolean
}

const defaultOptions: Options = {
  pretty: true,
  indent: INDENT.FOUR_SPACES,
  quote: QUOTE.DOUBLE,
  trailingComma: false
}

type Literal = string | number | boolean | null;

function escapeString(value: string, options: Options): string {
  return value
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(new RegExp(options.quote, "g"), `\\${options.quote}`);
}

function isLiteral(value: any): value is Literal {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function literalToPhpString(value: Literal, options: Options): string {
  if (value === null) {
    return TOKENS.NULL_KEYWORD;
  }

  switch (typeof value) {
    case 'string':
      return `${options.quote}${escapeString(value, options)}${options.quote}`;
    case 'number':
      return `${isNaN(value) ? TOKENS.NAN_KEYWORD : (isFinite(value) ? value : TOKENS.INF_KEYWORD)}`;
    case 'boolean':
      return value ? TOKENS.TRUE_KEYWORD : TOKENS.FALSE_KEYWORD;
  }
}

function handleValue(value: any, indentLevel: number, ommitComma: boolean, options: Options): string {
  if (isLiteral(value)) {
    return `${literalToPhpString(value, options)}${ommitComma ? '' : TOKENS.COMMA}`;
  }

  if (typeof value === 'object') {
    const baseIndent = options.indent.repeat(indentLevel);
    const stringBuilder: string[] = [
      TOKENS.OPEN_BRACKET
    ];
    if (Array.isArray(value)) {
      for (const [i, part] of value.entries()) {
        const ommitComma = !options.trailingComma && i === value.length - 1;
        stringBuilder.push(`${baseIndent}${options.indent}${handleValue(part, indentLevel + 1, ommitComma, options)}`);
      }
    } else { // Object
      const entries = Object.entries(value as { [k: string]: any });
      for (const [key, objectValue] of entries) {
        const ommitComma = !options.trailingComma && key === entries[entries.length - 1][0];
        stringBuilder.push(`${baseIndent}${options.indent}${options.quote}${key}${options.quote} ${TOKENS.ARROW} ${handleValue(objectValue, indentLevel + 1, ommitComma, options)}`);
      }
    }

    stringBuilder.push(`${baseIndent}${TOKENS.CLOSE_BRACKET}${ommitComma ? '' : TOKENS.COMMA}`);

    return stringBuilder.join("\n");
  }

  throw `Unsupported value of type '${typeof value}' with value '${value}'.`;
}

function toPhpArray(value: any, options?: Partial<Options>): string {
  return handleValue(value, 0, true, {
    ...defaultOptions,
    ...options
  });
}

toPhpArray.INDENT = INDENT;
toPhpArray.QUOTE = QUOTE;

export {toPhpArray};
