
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FilterSidebarProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedBrands: string[];
    setSelectedBrands: (brands: string[]) => void;
    selectedRam: string[];
    setSelectedRam: (ram: string[]) => void;
    selectedRom: string[];
    setSelectedRom: (rom: string[]) => void;
    selectedBattery: string;
    setSelectedBattery: (battery: string) => void;
    priceRange: number[];
    setPriceRange: (range: number[]) => void;
}

export default function FilterSidebar({
    selectedCategory,
    setSelectedCategory,
    selectedBrands,
    setSelectedBrands,
    selectedRam,
    setSelectedRam,
    selectedRom,
    setSelectedRom,
    selectedBattery,
    setSelectedBattery,
    priceRange,
    setPriceRange
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: any }>({
        category: true,
        brand: true,
        price: true,
        ram: false,
        rom: false,
        battery: false,
        os: false
    });

    const categories = ['Điện thoại', 'Tablet', 'Phụ kiện'];
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'Nokia', 'Tecno'];
    const ramOptions = ['3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];
    const romOptions = ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
    const batteryOptions = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Dưới 3000 mAh', value: '0-3000' },
        { label: 'Từ 3000 - 4000 mAh', value: '3000-4000' },
        { label: 'Từ 4000 - 5000 mAh', value: '4000-5000' },
        { label: 'Trên 5000 mAh', value: '5000-999999' }
    ];

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands(
            selectedBrands.includes(brand)
                ? selectedBrands.filter((b) => b !== brand)
                : [...selectedBrands, brand]
        );
    };

    const toggleRam = (ram: string) => {
        setSelectedRam(
            selectedRam.includes(ram)
                ? selectedRam.filter((r) => r !== ram)
                : [...selectedRam, ram]
        );
    };

    const toggleRom = (rom: string) => {
        setSelectedRom(
            selectedRom.includes(rom)
                ? selectedRom.filter((r) => r !== rom)
                : [...selectedRom, rom]
        );
    };

    const handlePriceRangeChange = (index: number, value: string) => {
        const newRange = [...priceRange];
        newRange[index] = Number(value);
        setPriceRange(newRange);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <div className="bg-white">
            {/* Loại sản phẩm */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('category')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Loại sản phẩm</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.category ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.category && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 space-y-2">
                                {categories.map(category => (
                                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === category}
                                            onChange={() => setSelectedCategory(category)}
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <span className="text-sm">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hãng sản xuất */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('brand')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Hãng sản xuất</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.brand ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.brand && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                {brands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => toggleBrand(brand)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedBrands.includes(brand)
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mức giá */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('price')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Mức giá</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.price && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                <div className="space-y-2 mb-4">
                                    {[
                                        { label: 'Tất cả', min: 0, max: 64000000 },
                                        { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
                                        { label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
                                        { label: 'Từ 4 - 7 triệu', min: 4000000, max: 7000000 },
                                        { label: 'Từ 7 - 13 triệu', min: 7000000, max: 13000000 },
                                        { label: 'Từ 13 - 20 triệu', min: 13000000, max: 20000000 },
                                        { label: 'Trên 20 triệu', min: 20000000, max: 64000000 }
                                    ].map((range, idx) => (
                                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={priceRange[0] === range.min && priceRange[1] === range.max}
                                                onChange={() => setPriceRange([range.min, range.max])}
                                                className="w-4 h-4 accent-red-600"
                                            />
                                            <span className="text-sm">{range.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="64000000"
                                        step="1000000"
                                        value={priceRange[0]}
                                        onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="64000000"
                                        step="1000000"
                                        value={priceRange[1]}
                                        onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                        placeholder="Từ"
                                    />
                                    <span>~</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                        placeholder="Đến"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RAM */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('ram')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">RAM</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.ram ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.ram && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                                {ramOptions.map(ram => (
                                    <button
                                        key={ram}
                                        onClick={() => toggleRam(ram)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedRam.includes(ram)
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {ram}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ROM */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('rom')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Dung lượng ROM</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.rom ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.rom && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                                {romOptions.map(rom => (
                                    <button
                                        key={rom}
                                        onClick={() => toggleRom(rom)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedRom.includes(rom)
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {rom}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Battery */}
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleSection('battery')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Hiệu năng và Pin</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.battery ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.battery && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 space-y-2">
                                {batteryOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedBattery === option.value}
                                            onChange={() => setSelectedBattery(option.value)}
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <span className="text-sm">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* OS */}
            <div>
                <button
                    onClick={() => toggleSection('os')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                    <span className="font-medium">Hệ điều hành</span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSections.os ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                <AnimatePresence>
                    {expandedSections.os && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 flex gap-2">
                                <button className="flex-1 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 text-sm font-medium">
                                    iOS
                                </button>
                                <button className="flex-1 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 text-sm font-medium">
                                    Android
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}