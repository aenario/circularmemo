# circularmemo

A convenience function to recursively iterates over a (like typescript's types)
with memoization and without breaking circular references.

It requires your function to expect itself as the first argument, and returns 
a similar function, you can then pass your function to a Y-combinator to get a 
"normal" function.

This package also provides a spreading Y combinator and the `MFN` type for this kind of
self-passed function.

```typescript
import { Y, circularmemo, MFN } from 'circularmemo'

interface Node {
    n: number,
    left: Node,
}
const circle: Node = { n: 1, left: { n: 2, left: (null as unknown as Node) } }
circle.left.left = circle

const _plusX: MFN<[Node, number], Node> = (self, x, n) =>
    ({ n: x.n + n, left: self(x.left, n) })

const plusX = Y(circularmemo({
    circularMarker: (_) => ({} as Node), // leave an empty object, which will be
    replaceMarker: (marker, res) => Object.assign(marker, res) // fill up the object
}, _plusX))

const result = plusX(circle, 1)
assert(result.n === 2)
assert(result.left.n === 3)
assert(result.left.left === result) // maintained circular
```

## Other options

The first arguments to `circularmemo` is a Param object which accepts 
the following functions.


```typescript
circularMarker: (...args: Args) => Marker,
replaceMarker: (tmp: Marker, final: Res) => Res

useMarker?: (tmp: Marker) => Res,
useExisting?: (existing: Res) => Res,
shouldMemo?: (...args: Args) => boolean,
keyMaker?: (...args: Args) => Key,
```
