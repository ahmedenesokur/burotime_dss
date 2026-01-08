-- =====================================================
-- BüroTime Karar Destek Sistemi - Database Schema
-- =====================================================
-- Database: karar-destek-sistemi (must exist)
-- Encoding: utf8mb4 with Turkish collation
-- Product-based sales and forecasting system
-- =====================================================

USE `karar-destek-sistemi`;

-- =====================================================
-- Table 1: urunler (Products)
-- =====================================================
CREATE TABLE IF NOT EXISTS `urunler` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `urun_kodu` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Product code (e.g., BT-001)',
    `urun_adi` VARCHAR(100) NOT NULL COMMENT 'Product name',
    `aktif_mi` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
    INDEX `idx_urun_kodu` (`urun_kodu`),
    INDEX `idx_aktif` (`aktif_mi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- Table 2: satis_verileri (Historical Sales Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS `satis_verileri` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `urun_id` INT NOT NULL COMMENT 'Foreign key to urunler',
    `ay` VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM (e.g., 2024-01)',
    `satis_adedi` INT NOT NULL COMMENT 'Monthly sales count for this product',
    `kampanya_var_mi` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = No campaign, 1 = Campaign exists',
    UNIQUE KEY `unique_urun_ay` (`urun_id`, `ay`),
    INDEX `idx_ay` (`ay`),
    INDEX `idx_urun_id` (`urun_id`),
    FOREIGN KEY (`urun_id`) REFERENCES `urunler`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- Table 3: tahmin_sonuclari (Forecast Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS `tahmin_sonuclari` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `urun_id` INT NOT NULL COMMENT 'Foreign key to urunler',
    `ay` VARCHAR(7) NOT NULL COMMENT 'Forecasted month: YYYY-MM',
    `tahmini_satis` INT NOT NULL COMMENT 'Forecasted sales amount for this product',
    `onerilen_uretim` INT NOT NULL COMMENT 'Recommended production quantity',
    `model_versiyonu` VARCHAR(50) DEFAULT 'moving_average_v1' COMMENT 'Model version identifier',
    INDEX `idx_ay` (`ay`),
    INDEX `idx_urun_id` (`urun_id`),
    FOREIGN KEY (`urun_id`) REFERENCES `urunler`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- Table 3: model_parametreleri (Model Parameters)
-- =====================================================
CREATE TABLE IF NOT EXISTS `model_parametreleri` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `guvenlik_stok_orani` DECIMAL(5,2) DEFAULT 10.00 COMMENT 'Safety stock percentage (e.g., 10.00 = +10%)',
    -- `kampanya_etkisi` removed: campaign impact multiplier is no longer stored globally
    `mevsimsellik_aktif` TINYINT(1) DEFAULT 1 COMMENT '0 = Seasonality OFF, 1 = Seasonality ON',
    `guncelleme_tarihi` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- Insert default model parameters
-- =====================================================
INSERT INTO `model_parametreleri` 
    (`guvenlik_stok_orani`, `mevsimsellik_aktif`) 
VALUES 
    (10.00, 1);
