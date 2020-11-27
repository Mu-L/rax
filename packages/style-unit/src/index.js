import { isWeb, isWeex } from 'universal-env';

const RPX_REG = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rpx/g;
const GLOBAL_RPX_COEFFICIENT = '__rpx_coefficient__';
const GLOBAL_VIEWPORT_WIDTH = '__viewport_width__';
const global =
  typeof window === 'object'
    ? window
    : typeof global === 'object'
      ? global
      : {};
// convertUnit method targetPlatform
let targetPlatform = isWeb ? 'web' : isWeex ? 'weex' : '';

// Init toFixed method
let unitPrecision = 4;

const toFixed = (number, precision) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};

// Dedault decimal px transformer.
let decimalPixelTransformer = (rpx, $1) => $1 ? parseFloat(rpx) * getRpx() + 'px' : rpx;

// Default decimal vw transformer.
const decimalVWTransformer = (rpx, $1) => $1 ? toFixed(parseFloat(rpx) / (getViewportWidth() / 100), unitPrecision) + 'vw' : rpx;

// Default 1 rpx to 1 px
if (getRpx() === undefined) {
  setRpx(1);
}

// Viewport width, default to 750.
if (getViewportWidth() === undefined) {
  setViewportWidth(750);
}

/**
 * Is string contains rpx
 * note: rpx is an alias to rpx
 * @param {String} str
 * @returns {Boolean}
 */
export function isRpx(str) {
  return typeof str === 'string' && RPX_REG.test(str);
}

/**
 * Calculate rpx
 * @param {String} str
 * @returns {String}
 */
export function calcRpx(str) {
  if (targetPlatform === 'web') {
    // In Web convert rpx to 'vw', same as driver-dom and driver-universal
    // '375rpx' => '50vw'
    return str.replace(RPX_REG, decimalVWTransformer);
  } else if (targetPlatform === 'weex') {
    // In Weex convert rpx to 'px'
    // '375rpx' => 375 * px
    return str.replace(RPX_REG, decimalPixelTransformer);
  } else {
    // Other platform return original value, like Mini-App and WX Mini-Program ...
    // '375rpx' => '375rpx'
    return str;
  }
}

export function getRpx() {
  return global[GLOBAL_RPX_COEFFICIENT];
}

export function setRpx(rpx) {
  global[GLOBAL_RPX_COEFFICIENT] = rpx;
}

export function getViewportWidth() {
  return global[GLOBAL_VIEWPORT_WIDTH];
}

export function setViewportWidth(viewport) {
  global[GLOBAL_VIEWPORT_WIDTH] = viewport;
}

/**
 * Set a function to transform unit of pixel,
 * default to passthrough.
 * @param {Function} transformer function
 */
export function setDecimalPixelTransformer(transformer) {
  decimalPixelTransformer = transformer;
}

/**
 * Set unit precision.
 * @param n {Number} Unit precision, default to 4.
 */
export function setUnitPrecision(n) {
  unitPrecision = n;
}

/**
 * Create a cached version of a pure function.
 */
export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(...args) {
    const key = args.reduceRight((prev, curr) => `${prev}-${curr}`);
    if (!cache[key]) cache[key] = fn(...args);
    return cache[key];
  };
}

/**
 * Convert rpx.
 * @param value
 * @param prop
 * @param platform
 * @return {String} Transformed value.
 */
export const convertUnit = cached((value, prop, platform) => {
  if (platform) {
    targetPlatform = platform;
  }
  // if lineHeight value is number, it shouldn't be transformed to string
  if (prop !== 'lineHeight') {
    value = value + '';
  }
  return isRpx(value) ? calcRpx(value) : value;
});
