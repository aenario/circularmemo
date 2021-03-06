type ArgsBase = any[]
type FN<Args extends ArgsBase, Res> = (...args: Args) => Res
export type MFN<Args extends ArgsBase, Res> = (fn: FN<Args, Res>, ...args: Args) => Res

type Y = <Args extends ArgsBase, Res>(mfn: MFN<Args, Res>) => FN<Args, Res>
type MAKER<Args extends ArgsBase, Res> = (m: MAKER<Args, Res>) => FN<Args, Res>
const M = <Args extends ArgsBase, Res>(x: MAKER<Args, Res>): FN<Args, Res> => x(x)

export const Y : Y = <Args extends ArgsBase, Res> (mfn: MFN<Args, Res>) =>
    M((maker: MAKER<Args, Res>) => (...args: Args) => mfn(maker(maker), ...args))

export function circularmemo<Args extends ArgsBase, Key, Marker extends Res, Res>(
    params: {
        shouldMemo?: (...args: Args) => boolean,
        keyMaker?: (...args: Args) => Key,
        circularMarker: (...args: Args) => Marker,
        replaceMarker: (tmp: Marker, final: Res) => Res
        useMarker?: (tmp: Marker) => Res,
        useExisting?: (existing: Res) => Res,
    },
    mfn: MFN<Args, Res>,
) : MFN<Args, Res>  {
    const inprogress: Map<Key, Marker> = new Map()
    const resolved: Map<Key, Res> = new Map()

    const shouldMemo = params.shouldMemo || (() => true)
    const keyMaker = params.keyMaker || ((...args: Args) => args[0] as Key)
    const circularMarker = params.circularMarker
    const replaceMarker = params.replaceMarker
    const useMarker = params.useMarker || ((x: Marker) => x)
    const useExisting = params.useExisting || ((x: Res) => x)

    return (fn: FN<Args, Res>, ...args: Args) => {
        if (!shouldMemo(...args)) return mfn(fn, ...args);

        const key = keyMaker(...args);

        let existing = resolved.get(key);
        if(existing) return useExisting(existing);

        let existingInProgress = inprogress.get(key);
        if(existingInProgress) return useMarker(existingInProgress);

        let marker = circularMarker(...args)
        inprogress.set(key, marker)
        let res: Res = mfn(fn, ...args)
        inprogress.delete(key)
        res = replaceMarker(marker, res)
        resolved.set(key, res);
        return res
    }
}