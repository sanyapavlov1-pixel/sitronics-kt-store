CREATE TABLE `categories` (
`id` serial AUTO_INCREMENT NOT NULL, `name` varchar(180) NOT NULL, `slug` varchar(190) NOT NULL,
`description` text, `sort_order` int NOT NULL DEFAULT 0, `is_active` boolean NOT NULL DEFAULT true,
CONSTRAINT `categories_id` PRIMARY KEY(`id`));
--> statement-breakpoint
CREATE TABLE `order_items` (
`id` serial AUTO_INCREMENT NOT NULL, `order_id` bigint unsigned NOT NULL, `product_id` bigint unsigned,
`product_name` varchar(255) NOT NULL, `sku` varchar(100), `price` decimal(14,2), `quantity` int NOT NULL,
CONSTRAINT `order_items_id` PRIMARY KEY(`id`));
--> statement-breakpoint
CREATE TABLE `orders` (
`id` serial AUTO_INCREMENT NOT NULL, `order_number` varchar(40) NOT NULL, `customer_name` varchar(180) NOT NULL,
`company` varchar(255) NOT NULL, `inn` varchar(12), `email` varchar(320) NOT NULL, `phone` varchar(50) NOT NULL,
`comment` text, `status` enum('new','processing','quoted','completed','cancelled') NOT NULL DEFAULT 'new',
`total` decimal(14,2), `created_at` timestamp NOT NULL DEFAULT (now()),
`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `orders_id` PRIMARY KEY(`id`), CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`));
--> statement-breakpoint
CREATE TABLE `products` (
`id` serial AUTO_INCREMENT NOT NULL, `category_id` bigint unsigned NOT NULL, `name` varchar(255) NOT NULL,
`slug` varchar(255) NOT NULL, `sku` varchar(100), `short_description` text NOT NULL, `description` text NOT NULL,
`specs` json NOT NULL, `price` decimal(14,2), `currency` varchar(3) NOT NULL DEFAULT 'RUB', `stock` int NOT NULL DEFAULT 0,
`availability` enum('in_stock','on_order','out_of_stock') NOT NULL DEFAULT 'on_order', `image_url` text,
`image_key` varchar(512), `is_featured` boolean NOT NULL DEFAULT false, `is_active` boolean NOT NULL DEFAULT true,
`created_at` timestamp NOT NULL DEFAULT (now()), `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `products_id` PRIMARY KEY(`id`), CONSTRAINT `products_slug_unique` UNIQUE(`slug`), CONSTRAINT `products_sku_unique` UNIQUE(`sku`));
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;
