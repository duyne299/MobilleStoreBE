"use client";
import { motion } from "framer-motion";

export default function CategoryGrid() {
    const categories = [
        {
            id: 1,
            name: 'Điện thoại',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/dien_thoai_icon_cate_240938806d.png'
        },
        {
            id: 2,
            name: 'Máy tính bảng',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/may_tinh_bang_ic_cate_dccb57ff5c.png'
        },
        {
            id: 3,
            name: 'Máy cũ giá rẻ',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/may_doi_tra_icon_cate_f272970ca9.png'
        },
        {
            id: 4,
            name: 'Apple',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/gycb_op_lung_8bce5a12b8.png'
        },
        {
            id: 5,
            name: 'Sạc dự phòng',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/small/gycb_sac_du_phong_b161bd7253.png'
        },
        {
            id: 6,
            name: 'Phụ kiện',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/phu_kien_ic_cate_ecae8ddd38.png'
        },
        {
            id: 7,
            name: 'Tai nghe',
            image: 'https://cdn2.fptshop.com.vn/unsafe/256x0/filters:format(webp):quality(75)/tai_nghe_75f34b0188.png'
        },
        {
            id: 8,
            name: 'Sạc & Cáp',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/gycb_sac_cap_b45959a879.png'
        },
        {
            id: 9,
            name: 'Loa',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/gycb_loa_cb174bf55b.png'
        },
        {
            id: 10,
            name: 'Cáp chuyển đổi',
            image: 'https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/small/gycb_hub_chuyen_doi_f66ba50acf.png'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="border-white rounded-2xl p-4 sm:p-6 bg-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Danh mục nổi bật</h2>

                {/* Mobile: Horizontal scroll */}
                <motion.div
                    className="grid grid-cols-4 gap-3 pb-2 md:hidden"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {categories.slice(0, 4).map((category) => (
                        <motion.div
                            key={category.id}
                            className="flex flex-col items-center cursor-pointer group w-full"
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg border border-gray-200 group-active:border-blue-400 transition-colors duration-300">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-center text-xs font-medium text-gray-800 line-clamp-2 px-1">
                                {category.name}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Desktop: Grid layout */}
                <motion.div
                    className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            className="flex flex-col items-center cursor-pointer group"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="w-24 h-24 lg:w-28 lg:h-28 aspect-square mb-2 overflow-hidden rounded-lg border border-gray-200 group-hover:border-blue-400 transition-colors duration-300">
                                <motion.img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-center text-sm font-medium text-gray-800 line-clamp-2 px-1">
                                {category.name}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}