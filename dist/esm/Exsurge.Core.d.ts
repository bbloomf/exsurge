/** a unit of measurement: one of Units.DeviceIndepenedent, Centimeters, Millimeters or Inches */
export type UnitsType = 0 | 1 | 2 | 3;
export declare const Units: {
    DeviceIndepenedent: UnitsType;
    Centimeters: UnitsType;
    Millimeters: UnitsType;
    Inches: UnitsType;
    DIU_PER_INCH: number;
    DIU_PER_CENTIMETER: number;
    ToDeviceIndependent: (n: number, inputUnits: UnitsType) => number;
    FromDeviceIndependent: (n: number, outputUnits: UnitsType) => number;
    StringToUnitsType: (s: string) => UnitsType;
    UnitsTypeToString: (units: UnitsType) => string;
};
export declare function DeviceIndependent(n: number): number;
export declare function Centimeters(n: number): number;
export declare function Millimeters(n: number): number;
export declare function Inches(n: number): number;
export declare function ToCentimeters(n: number): number;
export declare function ToMillimeters(n: number): number;
export declare function ToInches(n: number): number;
export declare class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    clone(): Point;
    equals(point: Point): boolean;
}
export declare class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
    clone(): Rect;
    isEmpty(): boolean;
    right(): number;
    bottom(): number;
    equals(rect: Rect): boolean;
    contains(other: Point | Rect): boolean;
    union(rect: Rect): void;
    unionWith(x: number, y: number, width: number, height: number): void;
}
/**
 * Margins
 *
 * @class
 */
export declare class Margins {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(left?: number, top?: number, right?: number, bottom?: number);
    clone(): Margins;
    equals(margins: Margins): boolean;
}
/**
 * Size
 *
 * @class
 */
export declare class Size {
    width: number;
    height: number;
    constructor(width?: number, height?: number);
    clone(): Size;
    equals(size: Size): boolean;
}
export declare const Step: {
    readonly Do: 0;
    readonly Du: 1;
    readonly Re: 2;
    readonly Me: 3;
    readonly Mi: 4;
    readonly Fa: 5;
    readonly Fu: 6;
    readonly So: 7;
    readonly La: 9;
    readonly Te: 10;
    readonly Ti: 11;
};
/** a step of the scale, which Step names */
export type Step = (typeof Step)[keyof typeof Step];
export declare class Pitch {
    /** a Step, though applying an accidental can make it any number */
    step: number;
    octave: number;
    /**
     * @param step the step within the octave, or, without an octave, the
     * number of half steps from step 0 of octave 0
     */
    constructor(step: number, octave?: number);
    toInt(): number;
    transpose(step: number): Pitch;
    isHigherThan(pitch: Pitch): boolean;
    isLowerThan(pitch: Pitch): boolean;
    equals(pitch: Pitch): boolean;
    static stepToStaffOffset(step: number): number;
    static staffOffsetToStep(offset: number): 0 | 2 | 4 | 5 | 7 | 9 | 11;
}
export declare function generateRandomGuid(): string;
export declare function getCssForProperties(properties: {
    [property: string]: unknown;
}): string;
//# sourceMappingURL=Exsurge.Core.d.ts.map