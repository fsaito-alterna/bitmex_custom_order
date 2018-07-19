// @flow
import origAssert from 'power-assert';

export const assert = origAssert.customize({
  output: {
    maxDepth: 8,
  },
});
