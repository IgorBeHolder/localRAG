import type { NoNullParams, RootMetadata } from './types';
/**
 * Recursively remove keys with null values from an object.
 * Also handles accepting undefined to prevent repeating this logic at each call site.
 */
export declare function removeNullValuesFromObject<T extends {}>(obj?: T): T | undefined;
/**
 * This remove null values from the metadata and filter properties of the given
 * object. This makes it easier to work with Pinecones lack of support for null.
 */
export declare function removeNullValues<Metadata extends RootMetadata, T extends NoNullParams<Metadata>>(obj: T | undefined): T | undefined;
//# sourceMappingURL=utils.d.ts.map