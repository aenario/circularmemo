import { Y, MFN, circularmemo } from '../lib/'
import assert from 'assert'

interface Person {
    name: string,
    age: number,
    father?: Person,
    brother?: Person,
    uncle?: Person,
    godFather?: Person,
    greatGrandSon?: Person
}

const jack: Person = { name: 'jack', age: 100 }
const john: Person = { name: 'john', age: 50, father: jack }
const steve: Person = { name: 'steve', age: 60, father: jack, brother: john }
john.brother = steve
const bob: Person = { name: 'bob', age: 30, father: john, uncle: steve, godFather: steve }
const louis: Person = { name: 'jack', age: 10, father: bob }
jack.greatGrandSon = louis

describe('Y', function () {
    it('works', () => {
        const factorial = Y<[number], number>((self, input) =>
            input == 0 ? 1 : input * self(input - 1))

        assert(factorial(6) == 720, 'Y-combined factorial did not works')

        const sum = Y<[number, number], number>((self, a, b) =>
            a == 0 ? b : b == 0 ? a : 2 + self(a - 1, b - 1))

        assert(sum(19, 23) == 42, 'Y-combined sum did not works')
    })
})

describe('circularmemo', function () {
    it('works', () => {
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
    })

})