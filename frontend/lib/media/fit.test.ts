import { describe, expect, it } from "vitest";
import {
  ASPECT_TOLERANCE,
  MAX_CONTAIN_CSS_SCALE,
  MIN_COVER_RESOLUTION,
  chooseFit,
  containBox,
} from "./fit";

describe("chooseFit", () => {
  it("covers when the aspect ratios match and the photo is large enough", () => {
    expect(chooseFit({ imageW: 4000, imageH: 2250, frameW: 1440, frameH: 810, dpr: 1 })).toBe("cover");
  });

  it("contains a small production gallery photo in the full-bleed services frame", () => {
    // 547 x 365 measured with fl_getinfo; desktop showcase frame is about 1440 x 660.
    expect(chooseFit({ imageW: 547, imageH: 365, frameW: 1440, frameH: 660, dpr: 1 })).toBe("contain");
  });

  it("contains a portrait photo in a landscape frame even when it is huge", () => {
    expect(chooseFit({ imageW: 3000, imageH: 4000, frameW: 1440, frameH: 660, dpr: 2 })).toBe("contain");
  });

  it("contains a landscape photo in a portrait frame", () => {
    expect(chooseFit({ imageW: 4000, imageH: 3000, frameW: 390, frameH: 560, dpr: 3 })).toBe("contain");
  });

  it("contains a square photo in a 4:5 product card (25 % apart)", () => {
    expect(chooseFit({ imageW: 554, imageH: 554, frameW: 255, frameH: 319, dpr: 2 })).toBe("contain");
  });

  it("covers a 4:5 photo in a 4:5 product card", () => {
    expect(chooseFit({ imageW: 1200, imageH: 1500, frameW: 255, frameH: 319, dpr: 2 })).toBe("cover");
  });

  it("accepts aspect differences up to the tolerance and rejects beyond it", () => {
    const frame = { frameW: 1000, frameH: 1000, dpr: 1 };
    const within = 1000 * (1 + ASPECT_TOLERANCE) - 1;
    const beyond = 1000 * (1 + ASPECT_TOLERANCE) + 10;
    expect(chooseFit({ imageW: within, imageH: 1000, ...frame })).toBe("cover");
    expect(chooseFit({ imageW: beyond, imageH: 1000, ...frame })).toBe("contain");
    expect(chooseFit({ imageW: 1000, imageH: beyond, ...frame })).toBe("contain");
  });

  it("covers only when the photo has the minimum resolution on the covering axis", () => {
    const frame = { frameW: 1000, frameH: 500, dpr: 1 };
    const enough = 1000 * MIN_COVER_RESOLUTION;
    expect(chooseFit({ imageW: enough, imageH: enough / 2, ...frame })).toBe("cover");
    expect(chooseFit({ imageW: enough - 20, imageH: (enough - 20) / 2, ...frame })).toBe("contain");
  });

  it("takes the screen density into account, capped at 2", () => {
    const photo = { imageW: 1200, imageH: 600, frameW: 1000, frameH: 500 };
    expect(chooseFit({ ...photo, dpr: 1 })).toBe("cover");
    // Needs 2000 device px; 1200 is 60 %.
    expect(chooseFit({ ...photo, dpr: 2 })).toBe("contain");
    const sharp = { imageW: 1600, imageH: 800, frameW: 1000, frameH: 500 };
    expect(chooseFit({ ...sharp, dpr: 2 })).toBe("cover");
    // A 3x phone is judged like a 2x screen.
    expect(chooseFit({ ...sharp, dpr: 3 })).toBe("cover");
  });

  it("ignores resolution for vector images", () => {
    expect(chooseFit({ imageW: 120, imageH: 150, frameW: 520, frameH: 650, dpr: 2, vector: true })).toBe("cover");
    expect(chooseFit({ imageW: 120, imageH: 90, frameW: 520, frameH: 650, dpr: 2, vector: true })).toBe("contain");
  });

  it("contains when any size is missing or invalid", () => {
    expect(chooseFit({ imageW: 0, imageH: 365, frameW: 1440, frameH: 660, dpr: 1 })).toBe("contain");
    expect(chooseFit({ imageW: 547, imageH: 365, frameW: 0, frameH: 660, dpr: 1 })).toBe("contain");
    expect(chooseFit({ imageW: Number.NaN, imageH: 365, frameW: 1440, frameH: 660, dpr: 1 })).toBe("contain");
  });

  it("treats a missing or invalid dpr as 1", () => {
    expect(chooseFit({ imageW: 1000, imageH: 500, frameW: 1000, frameH: 500, dpr: 0 })).toBe("cover");
    expect(chooseFit({ imageW: 1000, imageH: 500, frameW: 1000, frameH: 500, dpr: Number.NaN })).toBe("cover");
  });
});

describe("containBox", () => {
  it("never shows a small photo larger than 1.25 times its natural size on a 1x screen", () => {
    expect(containBox({ imageW: 547, imageH: 365, frameW: 1440, frameH: 660, dpr: 1 })).toEqual({
      width: Math.round(547 * MAX_CONTAIN_CSS_SCALE),
      height: Math.round(365 * MAX_CONTAIN_CSS_SCALE),
    });
  });

  it("never uses more than 2 device pixels per photo pixel", () => {
    // 2x laptop: 1 CSS px per photo px.
    expect(containBox({ imageW: 547, imageH: 365, frameW: 1440, frameH: 660, dpr: 2 })).toEqual({ width: 547, height: 365 });
  });

  it("is limited by the frame when the photo is large", () => {
    expect(containBox({ imageW: 3000, imageH: 4000, frameW: 1440, frameH: 660, dpr: 2 })).toEqual({ width: 495, height: 660 });
  });

  it("fits a landscape photo to the width of a phone frame", () => {
    // 390 x 560 frame on a 3x phone: frame-limited 390/744 = 0.524, device cap 2/3.
    expect(containBox({ imageW: 744, imageH: 412, frameW: 390, frameH: 560, dpr: 3 })).toEqual({ width: 390, height: 216 });
  });

  it("keeps the photo's aspect ratio", () => {
    const box = containBox({ imageW: 672, imageH: 448, frameW: 800, frameH: 800, dpr: 1 });
    expect(box.width / box.height).toBeCloseTo(672 / 448, 2);
  });

  it("lets vector images grow to the frame", () => {
    expect(containBox({ imageW: 120, imageH: 90, frameW: 520, frameH: 650, dpr: 2, vector: true })).toEqual({
      width: 520,
      height: 390,
    });
  });

  it("returns the frame size when a size is missing", () => {
    expect(containBox({ imageW: 0, imageH: 0, frameW: 300, frameH: 200, dpr: 1 })).toEqual({ width: 300, height: 200 });
  });
});
