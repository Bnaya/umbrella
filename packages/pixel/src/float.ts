import { splat8_24 } from "@thi.ng/binary";
import { clamp01 } from "@thi.ng/math";
import { IBlit, IInvert, IPixelBuffer } from "./api";
import { imageCanvas } from "./canvas";
import {
    abgrToGrayF32,
    blit1,
    clampRegion,
    ensureSize
} from "./utils";

/**
 * Buffer of 32bit float pixel values (single channel).
 */
export class FloatBuffer
    implements
        IPixelBuffer<Float32Array, number>,
        IBlit<Float32Array, number>,
        IInvert {
    /**
     * Takes a fully initialized image element and returns a
     * `FloatBuffer` instance of its contents. All original pixels are
     * converted to grayscale values in [0..1] interval. Optionally, a
     * target size can be given to obtain the pixels of a resized
     * version.
     *
     * @param img
     * @param width
     * @param height
     */
    static fromImage(img: HTMLImageElement, width?: number, height = width) {
        const ctx = imageCanvas(img, width, height);
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        return new FloatBuffer(
            w,
            h,
            abgrToGrayF32(
                new Uint32Array(ctx.ctx.getImageData(0, 0, w, h).data.buffer)
            )
        );
    }

    /**
     * Async version of `fromImage()`.
     *
     * @param img
     * @param width
     * @param height
     */
    static async fromImagePromise(
        img: Promise<HTMLImageElement>,
        width?: number,
        height = width
    ) {
        return FloatBuffer.fromImage(await img, width, height);
    }

    width: number;
    height: number;
    pixels: Float32Array;

    constructor(width: number, height = width, pixels?: Float32Array) {
        this.width = width;
        this.height = height;
        if (pixels) {
            ensureSize(pixels, width, height);
            this.pixels = pixels;
        } else {
            this.pixels = new Float32Array(width * height);
        }
    }

    blit(
        buf: IPixelBuffer<Float32Array, number>,
        dx = 0,
        dy = 0,
        sx = 0,
        sy = 0,
        w = this.width,
        h = this.height
    ) {
        blit1(
            this.pixels,
            buf.pixels,
            sx,
            sy,
            this.width,
            this.height,
            dx,
            dy,
            buf.width,
            buf.height,
            w,
            h
        );
    }

    blitCanvas(canvas: HTMLCanvasElement, x = 0, y = 0) {
        const ctx = canvas.getContext("2d")!;
        const idata = ctx.getImageData(x, y, this.width, this.height);
        const dest = new Uint32Array(idata.data.buffer);
        const src = this.pixels;
        for (let i = dest.length; --i >= 0; ) {
            dest[i] = splat8_24(clamp01(src[i]) * 255) | 0xff000000;
        }
        ctx.putImageData(idata, x, y);
    }

    getRegion(x: number, y: number, width: number, height: number) {
        [x, y, width, height] = clampRegion(
            x,
            y,
            width,
            height,
            this.width,
            this.height
        );
        const dest = new FloatBuffer(width, height);
        this.blit(dest, 0, 0, x, y, width, height);
        return dest;
    }

    getAt(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
            ? this.pixels[(x | 0) + (y | 0) * this.width]
            : 0;
    }

    setAt(x: number, y: number, col: number) {
        x >= 0 &&
            x < this.width &&
            y >= 0 &&
            y < this.height &&
            (this.pixels[(x | 0) + (y | 0) * this.width] = col);
        return this;
    }

    invert() {
        const pix = this.pixels;
        for (let i = pix.length; --i >= 0; ) {
            pix[i] = 1 - clamp01(pix[i]);
        }
        return this;
    }
}