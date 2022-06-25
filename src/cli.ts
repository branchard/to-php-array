#!/usr/bin/env node
import { toPhpArray } from './main'

const arr = toPhpArray({
  test: [
    'zef',
    1,
    {
      'lol': 5,
    },
    null,
    false,
    {
      'lol': 5 / 0,
      "hay": '""ezzed"ré"',
      "hoy": "'eee\\'\"ezzed\"ré\""
    },
    // () => 5
  ]
}, {
  trailingComma: false,
  quote: toPhpArray.QUOTE.SIMPLE,
  indent: toPhpArray.INDENT.TAB
});

console.log(arr);
