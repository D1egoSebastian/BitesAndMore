import { describe, expect, it } from "vitest";
import {
  blurTransformation,
  cloudinaryBlurLoader,
  cloudinaryPhotoLoader,
  cloudinaryUrl,
  isCloudinaryUrl,
  isVectorSource,
  photoTransformation,
} from "./cloudinary";

const BASE = "https://res.cloudinary.com/demo/image/upload";

describe("isCloudinaryUrl", () => {
  it("recognises Cloudinary image upload URLs", () => {
    expect(isCloudinaryUrl(`${BASE}/v1712345678/bitesandmore/cake.jpg`)).toBe(true);
    expect(isCloudinaryUrl(`${BASE}/cake.jpg`)).toBe(true);
  });

  it("rejects every other source", () => {
    expect(isCloudinaryUrl("/mock/mock-brownies.svg")).toBe(false);
    expect(isCloudinaryUrl("/brand/logo.jpg")).toBe(false);
    expect(isCloudinaryUrl("https://images.unsplash.com/photo-1?w=1200")).toBe(false);
    expect(isCloudinaryUrl("https://res.cloudinary.com/demo/video/upload/clip.mp4")).toBe(false);
    expect(isCloudinaryUrl("https://res.cloudinary.com/demo/image/fetch/https://example.com/a.jpg")).toBe(false);
    expect(isCloudinaryUrl("http://res.cloudinary.com.evil.test/demo/image/upload/a.jpg")).toBe(false);
    expect(isCloudinaryUrl("")).toBe(false);
  });
});

describe("photoTransformation and blurTransformation", () => {
  it("never upscale and let Cloudinary pick format and quality", () => {
    expect(photoTransformation(640)).toBe("f_auto,q_auto:good,c_limit,w_640,dpr_1");
    expect(blurTransformation(64)).toBe("f_auto,q_auto:low,c_limit,w_64,e_blur:400");
  });

  it("round widths to whole pixels and never go below 1", () => {
    expect(photoTransformation(639.6)).toBe("f_auto,q_auto:good,c_limit,w_640,dpr_1");
    expect(photoTransformation(0)).toBe("f_auto,q_auto:good,c_limit,w_1,dpr_1");
  });
});

describe("cloudinaryUrl", () => {
  const t = photoTransformation(640);

  it("inserts the transformation before the version and keeps folders", () => {
    expect(cloudinaryUrl(`${BASE}/v1712345678/bitesandmore/services/mesa.jpg`, t)).toBe(
      `${BASE}/${t}/v1712345678/bitesandmore/services/mesa.jpg`,
    );
  });

  it("works without a version segment", () => {
    expect(cloudinaryUrl(`${BASE}/bitesandmore/cake.jpg`, t)).toBe(`${BASE}/${t}/bitesandmore/cake.jpg`);
    expect(cloudinaryUrl(`${BASE}/cake.jpg`, t)).toBe(`${BASE}/${t}/cake.jpg`);
  });

  it("does not mistake a folder with an underscore for a transformation", () => {
    expect(cloudinaryUrl(`${BASE}/my_folder/cake.jpg`, t)).toBe(`${BASE}/${t}/my_folder/cake.jpg`);
  });

  it("keeps foreign transformations and applies ours after them", () => {
    expect(cloudinaryUrl(`${BASE}/c_crop,g_face,w_800,h_800/v1/cake.jpg`, t)).toBe(
      `${BASE}/c_crop,g_face,w_800,h_800/${t}/v1/cake.jpg`,
    );
    expect(cloudinaryUrl(`${BASE}/a_90/cake.jpg`, t)).toBe(`${BASE}/a_90/${t}/cake.jpg`);
  });

  it("is idempotent: our own transformation is replaced, not stacked", () => {
    const once = cloudinaryUrl(`${BASE}/v1712345678/bitesandmore/cake.jpg`, t);
    expect(cloudinaryUrl(once, t)).toBe(once);
    expect(cloudinaryUrl(once, photoTransformation(1080))).toBe(
      `${BASE}/${photoTransformation(1080)}/v1712345678/bitesandmore/cake.jpg`,
    );
    const foreign = cloudinaryUrl(`${BASE}/a_90/cake.jpg`, t);
    expect(cloudinaryUrl(foreign, blurTransformation(64))).toBe(`${BASE}/a_90/${blurTransformation(64)}/cake.jpg`);
  });

  it("keeps query strings and fragments", () => {
    expect(cloudinaryUrl(`${BASE}/v1/cake.jpg?_a=xyz`, t)).toBe(`${BASE}/${t}/v1/cake.jpg?_a=xyz`);
  });

  it("returns any other source untouched", () => {
    expect(cloudinaryUrl("/mock/mock-brownies.svg", t)).toBe("/mock/mock-brownies.svg");
    expect(cloudinaryUrl("https://images.unsplash.com/photo-1?w=1200", t)).toBe("https://images.unsplash.com/photo-1?w=1200");
  });
});

describe("loaders", () => {
  it("build the photo URL for each srcset width", () => {
    expect(cloudinaryPhotoLoader({ src: `${BASE}/v1/cake.jpg`, width: 1080 })).toBe(`${BASE}/${photoTransformation(1080)}/v1/cake.jpg`);
  });

  it("build a tiny blurred variant for the backdrop", () => {
    expect(cloudinaryBlurLoader({ src: `${BASE}/v1/cake.jpg`, width: 128 })).toBe(`${BASE}/${blurTransformation(128)}/v1/cake.jpg`);
  });
});

describe("isVectorSource", () => {
  it("detects SVG files, ignoring query strings and case", () => {
    expect(isVectorSource("/mock/mock-brownies.svg")).toBe(true);
    expect(isVectorSource("/mock/A.SVG?v=2")).toBe(true);
    expect(isVectorSource(`${BASE}/v1/cake.jpg`)).toBe(false);
  });
});
