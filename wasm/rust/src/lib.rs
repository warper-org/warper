use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub struct Virtualizer {
    item_sizes: Vec<f64>,
    item_offsets: Vec<f64>,
    total_height: f64,
}

#[wasm_bindgen]
impl Virtualizer {
    #[wasm_bindgen(constructor)]
    pub fn new(item_sizes: Vec<f64>) -> Virtualizer {
        console::log_1(&"Initializing Rust Virtualizer".into());
        let mut item_offsets = Vec::with_capacity(item_sizes.len());
        let mut current_offset = 0.0;
        for &size in &item_sizes {
            item_offsets.push(current_offset);
            current_offset += size;
        }
        console::log_1(&"Virtualizer Initialized".into());
        Virtualizer {
            item_sizes,
            item_offsets,
            total_height: current_offset,
        }
    }

    #[wasm_bindgen(js_name = newWithFixedSize)]
    pub fn new_with_fixed_size(item_count: usize, item_size: f64) -> Virtualizer {
        let item_sizes = vec![item_size; item_count];
        Self::new(item_sizes)
    }

    #[wasm_bindgen(js_name = getRangeAndTotalHeight)]
    pub fn get_range_and_total_height(&self, scroll_top: f64, container_height: f64, overscan: usize) -> JsValue {
        let start_index = self.find_start_index(scroll_top);
        
        let mut end_index = start_index;
        let mut current_height = 0.0;
        while end_index < self.item_sizes.len() && current_height < container_height {
            current_height += self.item_sizes[end_index];
            end_index += 1;
        }

        let visible_start_index = start_index.saturating_sub(overscan);
        let visible_end_index = (end_index + overscan).min(self.item_sizes.len());

        let mut items = Vec::new();
        for i in visible_start_index..visible_end_index {
            items.push(VirtualItem {
                index: i,
                size: self.item_sizes[i],
                offset_top: self.item_offsets[i],
            });
        }

        serde_wasm_bindgen::to_value(&VirtualResult {
            items,
            total_height: self.total_height,
        }).unwrap()
    }

    fn find_start_index(&self, scroll_top: f64) -> usize {
        match self.item_offsets.binary_search_by(|offset| offset.partial_cmp(&scroll_top).unwrap()) {
            Ok(index) => index,
            Err(index) => index.saturating_sub(1),
        }
    }
}

#[derive(serde::Serialize)]
struct VirtualItem {
    index: usize,
    size: f64,
    offset_top: f64,
}

#[derive(serde::Serialize)]
struct VirtualResult {
    items: Vec<VirtualItem>,
    total_height: f64,
}
