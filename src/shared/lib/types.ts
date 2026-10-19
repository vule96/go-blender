/** Axis-aligned box in map (viewBox) units: [minX, minY, maxX, maxY]. */
export type Bounds = readonly [minX: number, minY: number, maxX: number, maxY: number];

export type Point = readonly [x: number, y: number];

/** Compile-time guard for exhaustive `switch` statements. */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}
