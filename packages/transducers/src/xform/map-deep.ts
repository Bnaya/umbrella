import { Transducer, TransformSpec } from "../api";
import { deepTransform } from "../func/deep-transform";
import { iterator1 } from "../iterator";
import { map } from "./map";

/**
 * Transducer. Same as `map(deepTransform(spec))`
 *
 * See `deepTransform()` for details.
 *
 * @param spec
 * @param src
 */
export function mapDeep(spec: TransformSpec): Transducer<any, any>;
export function mapDeep(
    spec: TransformSpec,
    src: Iterable<any>
): IterableIterator<any>;
export function mapDeep(spec: TransformSpec, src?: Iterable<any>): any {
    return src ? iterator1(mapDeep(spec), src) : map(deepTransform(spec));
}
