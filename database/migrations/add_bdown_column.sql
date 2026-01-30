-- Add BDOWN column to partlist_produk_items table
ALTER TABLE partlist_produk_items 
ADD COLUMN BDOWN VARCHAR(50) DEFAULT '' AFTER unit;

-- Add index for better performance if needed
-- CREATE INDEX idx_partlist_produk_items_bdown ON partlist_produk_items(BDOWN);
