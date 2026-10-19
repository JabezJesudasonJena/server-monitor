import {mock as mockFn, MockProxy} from "vitest-mock-extended"

declare global {
    var mock: typeof mockFn;
    type mock<T> = MockProxy<T>;
    type Mocked<T> = MockProxy<T>;
}