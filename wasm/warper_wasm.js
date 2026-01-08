let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let WASM_VECTOR_LEN = 0;

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

export function init() {
    wasm.init();
}

/**
 * Benchmark Fenwick tree - returns ops/second
 * @param {number} count
 * @param {number} iterations
 * @returns {number}
 */
export function bench_fenwick(count, iterations) {
    const ret = wasm.bench_fenwick(count, iterations);
    return ret;
}

/**
 * @returns {string}
 */
export function get_version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_version(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_1(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Run full benchmark suite - returns formatted results
 * @returns {string}
 */
export function run_benchmarks() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.run_benchmarks(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_1(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Benchmark variable virtualizer - returns ops/second
 * @param {number} count
 * @param {number} iterations
 * @returns {number}
 */
export function bench_variable(count, iterations) {
    const ret = wasm.bench_variable(count, iterations);
    return ret;
}

/**
 * Benchmark uniform virtualizer - returns ops/second
 * @param {number} count
 * @param {number} iterations
 * @returns {number}
 */
export function bench_uniform(count, iterations) {
    const ret = wasm.bench_uniform(count, iterations);
    return ret;
}

const QuantumFenwickFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quantumfenwick_free(ptr >>> 0, 1));
/**
 * Ultra-optimized Fenwick Tree (Binary Indexed Tree)
 * Features:
 * - Branchless bit manipulation
 * - Cache-friendly sequential updates
 * - O(1) total query via cached sum
 * - O(log n) prefix sum and point update
 */
export class QuantumFenwick {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(QuantumFenwick.prototype);
        obj.__wbg_ptr = ptr;
        QuantumFenwickFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuantumFenwickFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quantumfenwick_free(ptr, 0);
    }
    /**
     * Find index at offset using branchless binary search - O(log n)
     * This is the CRITICAL hot path for variable-size virtualization
     * @param {number} offset
     * @returns {number}
     */
    find_index(offset) {
        const ret = wasm.quantumfenwick_find_index(this.__wbg_ptr, offset);
        return ret >>> 0;
    }
    /**
     * Query prefix sum [0, idx) - O(log n)
     * Uses branchless bit manipulation
     * @param {number} idx
     * @returns {number}
     */
    prefix_sum(idx) {
        const ret = wasm.quantumfenwick_prefix_sum(this.__wbg_ptr, idx);
        return ret;
    }
    /**
     * Create with uniform sizes
     * @param {number} count
     * @param {number} size
     * @returns {QuantumFenwick}
     */
    static new_uniform(count, size) {
        const ret = wasm.quantumfenwick_new_uniform(count, size);
        return QuantumFenwick.__wrap(ret);
    }
    /**
     * Batch update multiple sizes - optimized for bulk ops
     * @param {Uint32Array} indices
     * @param {Float64Array} new_sizes
     */
    batch_update(indices, new_sizes) {
        const ptr0 = passArray32ToWasm0(indices, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(new_sizes, wasm.__wbindgen_export_0);
        const len1 = WASM_VECTOR_LEN;
        wasm.quantumfenwick_batch_update(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * Get number of items
     * @returns {number}
     */
    len() {
        const ret = wasm.quantumfenwick_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Construct Fenwick tree in O(n) time
     * @param {Float64Array} sizes
     */
    constructor(sizes) {
        const ptr0 = passArrayF64ToWasm0(sizes, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.quantumfenwick_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        QuantumFenwickFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get total height - O(1) cached
     * @returns {number}
     */
    total() {
        const ret = wasm.quantumfenwick_total(this.__wbg_ptr);
        return ret;
    }
    /**
     * Update size at index - O(log n)
     * @param {number} idx
     * @param {number} new_size
     */
    update(idx, new_size) {
        wasm.quantumfenwick_update(this.__wbg_ptr, idx, new_size);
    }
    /**
     * Get size at specific index - O(1)
     * @param {number} idx
     * @returns {number}
     */
    get_size(idx) {
        const ret = wasm.quantumfenwick_get_size(this.__wbg_ptr, idx);
        return ret;
    }
    /**
     * Check if empty
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.quantumfenwick_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
}

const QuantumProfilerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quantumprofiler_free(ptr >>> 0, 1));
/**
 * High-performance profiler with O(1) running statistics
 */
export class QuantumProfiler {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuantumProfilerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quantumprofiler_free(ptr, 0);
    }
    /**
     * Add sample with O(1) ring buffer insert
     * @param {number} value
     */
    add(value) {
        wasm.quantumprofiler_add(this.__wbg_ptr, value);
    }
    /**
     * Get average - O(1)
     * @returns {number}
     */
    avg() {
        const ret = wasm.quantumprofiler_avg(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get FPS from frame times - O(1)
     * @returns {number}
     */
    fps() {
        const ret = wasm.quantumprofiler_fps(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get max - O(1)
     * @returns {number}
     */
    max() {
        const ret = wasm.quantumprofiler_max(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get min - O(1)
     * @returns {number}
     */
    min() {
        const ret = wasm.quantumprofiler_min(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} capacity
     */
    constructor(capacity) {
        const ret = wasm.quantumprofiler_new(capacity);
        this.__wbg_ptr = ret >>> 0;
        QuantumProfilerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Reset statistics
     */
    reset() {
        wasm.quantumprofiler_reset(this.__wbg_ptr);
    }
}

const QuantumUniformFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quantumuniform_free(ptr >>> 0, 1));
/**
 * Ultimate O(1) virtualizer for fixed-height items
 * Every single operation completes in constant time
 * Zero allocations in hot path - uses pre-allocated pools
 */
export class QuantumUniform {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuantumUniformFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quantumuniform_free(ptr, 0);
    }
    /**
     * Calculate visible range with ADAPTIVE OVERSCAN
     * Returns packed: [start, end, total_height, velocity]
     * @param {number} scroll
     * @param {number} viewport
     * @param {number} overscan
     * @returns {Float64Array}
     */
    calc_range(scroll, viewport, overscan) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.quantumuniform_calc_range(retptr, this.__wbg_ptr, scroll, viewport, overscan);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_1(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get offset for index - O(1) BRANCHLESS
     * @param {number} index
     * @returns {number}
     */
    get_offset(index) {
        const ret = wasm.quantumuniform_get_offset(this.__wbg_ptr, index);
        return ret;
    }
    /**
     * Get item count - O(1)
     * @returns {number}
     */
    item_count() {
        const ret = wasm.quantumuniform_item_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get visible indices as zero-copy typed array
     * @param {number} start
     * @param {number} end
     * @returns {Uint32Array}
     */
    get_indices(start, end) {
        const ret = wasm.quantumuniform_get_indices(this.__wbg_ptr, start, end);
        return takeObject(ret);
    }
    /**
     * Get visible offsets as zero-copy typed array
     * @param {number} start
     * @param {number} end
     * @returns {Float64Array}
     */
    get_offsets(start, end) {
        const ret = wasm.quantumuniform_get_offsets(this.__wbg_ptr, start, end);
        return takeObject(ret);
    }
    /**
     * Update scroll velocity for adaptive overscan
     * @param {number} v
     */
    set_velocity(v) {
        wasm.quantumuniform_set_velocity(this.__wbg_ptr, v);
    }
    /**
     * Get total scrollable height - O(1)
     * @returns {number}
     */
    total_height() {
        const ret = wasm.quantumprofiler_min(this.__wbg_ptr);
        return ret;
    }
    /**
     * Check if range has changed (for skip-render)
     * @param {number} scroll
     * @param {number} viewport
     * @param {number} overscan
     * @returns {boolean}
     */
    range_changed(scroll, viewport, overscan) {
        const ret = wasm.quantumuniform_range_changed(this.__wbg_ptr, scroll, viewport, overscan);
        return ret !== 0;
    }
    /**
     * Update item size - O(1)
     * @param {number} size
     */
    set_item_size(size) {
        wasm.quantumuniform_set_item_size(this.__wbg_ptr, size);
    }
    /**
     * Create new uniform virtualizer - O(1)
     * @param {number} count
     * @param {number} item_size
     */
    constructor(count, item_size) {
        const ret = wasm.quantumuniform_new(count, item_size);
        this.__wbg_ptr = ret >>> 0;
        QuantumUniformFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Free resources
     */
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.quantumuniform_free(ptr);
    }
    /**
     * Get index at offset - O(1) BRANCHLESS
     * @param {number} offset
     * @returns {number}
     */
    get_index(offset) {
        const ret = wasm.quantumuniform_get_index(this.__wbg_ptr, offset);
        return ret >>> 0;
    }
    /**
     * Get visible sizes as zero-copy typed array
     * @param {number} count
     * @returns {Float64Array}
     */
    get_sizes(count) {
        const ret = wasm.quantumuniform_get_sizes(this.__wbg_ptr, count);
        return takeObject(ret);
    }
    /**
     * Get item size - O(1)
     * @returns {number}
     */
    item_size() {
        const ret = wasm.quantumfenwick_total(this.__wbg_ptr);
        return ret;
    }
    /**
     * Update item count - O(1)
     * @param {number} count
     */
    set_count(count) {
        wasm.quantumuniform_set_count(this.__wbg_ptr, count);
    }
}

const QuantumVariableFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quantumvariable_free(ptr >>> 0, 1));
/**
 * High-performance virtualizer for variable item heights
 * Uses Fenwick tree for O(log n) prefix sums and binary search
 */
export class QuantumVariable {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(QuantumVariable.prototype);
        obj.__wbg_ptr = ptr;
        QuantumVariableFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuantumVariableFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quantumvariable_free(ptr, 0);
    }
    /**
     * Calculate visible range with adaptive overscan - O(log n)
     * @param {number} scroll
     * @param {number} viewport
     * @param {number} overscan
     * @returns {Float64Array}
     */
    calc_range(scroll, viewport, overscan) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.quantumvariable_calc_range(retptr, this.__wbg_ptr, scroll, viewport, overscan);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_1(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get offset for index - O(log n)
     * @param {number} index
     * @returns {number}
     */
    get_offset(index) {
        const ret = wasm.quantumfenwick_prefix_sum(this.__wbg_ptr, index);
        return ret;
    }
    /**
     * Get item count - O(1)
     * @returns {number}
     */
    item_count() {
        const ret = wasm.quantumfenwick_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get visible indices as zero-copy typed array
     * @param {number} start
     * @param {number} end
     * @returns {Uint32Array}
     */
    get_indices(start, end) {
        const ret = wasm.quantumvariable_get_indices(this.__wbg_ptr, start, end);
        return takeObject(ret);
    }
    /**
     * Get visible offsets as zero-copy typed array - O(k)
     * @param {number} start
     * @param {number} end
     * @returns {Float64Array}
     */
    get_offsets(start, end) {
        const ret = wasm.quantumvariable_get_offsets(this.__wbg_ptr, start, end);
        return takeObject(ret);
    }
    /**
     * Create with uniform sizes (variable-ready)
     * @param {number} count
     * @param {number} size
     * @returns {QuantumVariable}
     */
    static new_uniform(count, size) {
        const ret = wasm.quantumvariable_new_uniform(count, size);
        return QuantumVariable.__wrap(ret);
    }
    /**
     * Update item size - O(log n)
     * @param {number} index
     * @param {number} new_size
     */
    update_size(index, new_size) {
        wasm.quantumvariable_update_size(this.__wbg_ptr, index, new_size);
    }
    /**
     * Batch update sizes - optimized for bulk ops
     * @param {Uint32Array} indices
     * @param {Float64Array} new_sizes
     */
    batch_update(indices, new_sizes) {
        const ptr0 = passArray32ToWasm0(indices, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(new_sizes, wasm.__wbindgen_export_0);
        const len1 = WASM_VECTOR_LEN;
        wasm.quantumvariable_batch_update(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * Update velocity
     * @param {number} v
     */
    set_velocity(v) {
        wasm.quantumvariable_set_velocity(this.__wbg_ptr, v);
    }
    /**
     * Get total height - O(1)
     * @returns {number}
     */
    total_height() {
        const ret = wasm.quantumfenwick_total(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} scroll
     * @param {number} viewport
     * @param {number} overscan
     * @returns {VirtualRangeResult}
     */
    getRangeAndTotalHeight(scroll, viewport, overscan) {
        const ret = wasm.quantumvariable_getRangeAndTotalHeight(this.__wbg_ptr, scroll, viewport, overscan);
        return VirtualRangeResult.__wrap(ret);
    }
    /**
     * Create variable virtualizer from sizes array
     * @param {Float64Array} sizes
     */
    constructor(sizes) {
        const ptr0 = passArrayF64ToWasm0(sizes, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.quantumvariable_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        QuantumVariableFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Free resources
     */
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.quantumvariable_free(ptr);
    }
    /**
     * Get size at index - O(1)
     * @param {number} index
     * @returns {number}
     */
    get_size(index) {
        const ret = wasm.quantumfenwick_get_size(this.__wbg_ptr, index);
        return ret;
    }
    /**
     * Get index at offset - O(log n) branchless
     * @param {number} offset
     * @returns {number}
     */
    get_index(offset) {
        const ret = wasm.quantumfenwick_find_index(this.__wbg_ptr, offset);
        return ret >>> 0;
    }
    /**
     * Get visible sizes as zero-copy typed array - O(k)
     * @param {number} start
     * @param {number} end
     * @returns {Float64Array}
     */
    get_sizes(start, end) {
        const ret = wasm.quantumvariable_get_sizes(this.__wbg_ptr, start, end);
        return takeObject(ret);
    }
}

const VirtualItemFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_virtualitem_free(ptr >>> 0, 1));
/**
 * Legacy virtual item struct
 */
export class VirtualItem {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VirtualItem.prototype);
        obj.__wbg_ptr = ptr;
        VirtualItemFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VirtualItemFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualitem_free(ptr, 0);
    }
    /**
     * @param {number} index
     * @param {number} offset_top
     * @param {number} size
     */
    constructor(index, offset_top, size) {
        const ret = wasm.virtualitem_new(index, offset_top, size);
        this.__wbg_ptr = ret >>> 0;
        VirtualItemFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.virtualitem_free(ptr);
    }
    /**
     * @returns {number}
     */
    get index() {
        const ret = wasm.__wbg_get_virtualitem_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set index(arg0) {
        wasm.__wbg_set_virtualitem_index(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get offset_top() {
        const ret = wasm.__wbg_get_virtualitem_offset_top(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set offset_top(arg0) {
        wasm.__wbg_set_virtualitem_offset_top(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get size() {
        const ret = wasm.__wbg_get_virtualitem_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set size(arg0) {
        wasm.__wbg_set_virtualitem_size(this.__wbg_ptr, arg0);
    }
}

const VirtualRangeResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_virtualrangeresult_free(ptr >>> 0, 1));
/**
 * Legacy range result struct
 */
export class VirtualRangeResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VirtualRangeResult.prototype);
        obj.__wbg_ptr = ptr;
        VirtualRangeResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VirtualRangeResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualrangeresult_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    get_indices() {
        const ret = wasm.virtualrangeresult_get_indices(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {Float64Array}
     */
    get_offsets() {
        const ret = wasm.virtualrangeresult_get_offsets(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {number}
     */
    items_count() {
        const ret = wasm.virtualrangeresult_items_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.virtualrangeresult_free(ptr);
    }
    /**
     * @param {number} idx
     * @returns {VirtualItem | undefined}
     */
    get_item(idx) {
        const ret = wasm.virtualrangeresult_get_item(this.__wbg_ptr, idx);
        return ret === 0 ? undefined : VirtualItem.__wrap(ret);
    }
    /**
     * @returns {Float64Array}
     */
    get_sizes() {
        const ret = wasm.virtualrangeresult_get_sizes(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {number}
     */
    get total_height() {
        const ret = wasm.__wbg_get_virtualitem_offset_top(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set total_height(arg0) {
        wasm.__wbg_set_virtualitem_offset_top(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get start_index() {
        const ret = wasm.__wbg_get_virtualrangeresult_start_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start_index(arg0) {
        wasm.__wbg_set_virtualrangeresult_start_index(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get end_index() {
        const ret = wasm.__wbg_get_virtualrangeresult_end_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set end_index(arg0) {
        wasm.__wbg_set_virtualrangeresult_end_index(this.__wbg_ptr, arg0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_93c8e0c1a479fa1a = function(arg0, arg1, arg2) {
        const ret = new Float64Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_f1dead44d1fc7212 = function(arg0, arg1, arg2) {
        const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_807e54c39636c349 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('warper_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
