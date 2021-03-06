import { fmod as _fmod } from "@thi.ng/math";
import { ARGS_VV, defHofOp } from "./internal/codegen";
import { FN2 } from "./internal/templates";

/**
 * This version of mod uses the same logic as in GLSL, whereas `mod`
 * merely uses JavaScript's `%` modulo operator, yielding different
 * results for negative values.
 *
 * `a - b * floor(a/b)`
 *
 */
export const [fmod, fmod2, fmod3, fmod4] = defHofOp(_fmod, FN2("op"), ARGS_VV);
