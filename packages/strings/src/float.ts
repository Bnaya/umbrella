import { memoizeJ } from "@thi.ng/memoize";

import { Stringer } from "./api";
import { padLeft } from "./pad-left";

/**
 * Returns `Stringer` which formats numbers to given precision.
 * Exceptions:
 *
 * - NaN => "NaN"
 * - Infinity => "+/-∞"
 *
 * @param len number of fractional digits
 * @kind function
 */
export const float: (prec: number) => Stringer<number> = memoizeJ(
    (prec) => (x: number) => nanOrInf(x) || x.toFixed(prec)
);

/**
 * Similar to `float`, returns `Stringer` which formats numbers to given
 * character width & precision. Uses scientific notation if needed.
 *
 * Default precision: 3 fractional digits
 */
export const floatFixedWidth: (
    width: number,
    prec?: number
) => Stringer<number> = memoizeJ((width, prec = 3) => {
    const l = width - prec - 1;
    const pl = Math.pow(10, l);
    const pln = -Math.pow(10, l - 1);
    const pr = Math.pow(10, -(prec - 1));
    const pad = padLeft(width);
    return (x: number) => {
        const ax = Math.abs(x);
        return pad(
            nanOrInf(x) ||
                (x === 0
                    ? "0"
                    : ax < pr || ax >= pl
                        ? exp(x, width)
                        : x.toFixed(prec - (x < pln ? 1 : 0)))
        );
    };
});

const exp = (x: number, w: number) =>
    x.toExponential(
        Math.max(
            w -
                4 -
                (Math.log(Math.abs(x)) / Math.LN10 >= 10 ? 2 : 1) -
                (x < 0 ? 1 : 0),
            0
        )
    );

const nanOrInf = (x: number) =>
    isNaN(x)
        ? "NaN"
        : x === Infinity
            ? "+∞"
            : x === -Infinity
                ? "-∞"
                : undefined;
