import { ArrowRight } from 'lucide-react';

export default function BlackFridayDeals() {
    const deals = [
        {
            id: 1,
            title: 'Sạc Nhanh Siêu Tốc',
            subtitle: 'Sạc không dây giảm đến 40%',
            cta: 'Mua ngay',
            image: 'https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/2023_4_14_638171062873675866_00872274-04.jpg',
            size: 'small'
        },
        {
            id: 2,
            title: 'Điện Thoại Flagship',
            subtitle: 'iPhone & Samsung giảm tới 30%',
            cta: 'Rinh ngay',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
            size: 'large'
        },
        {
            id: 3,
            title: 'Tai Nghe Cao Cấp',
            subtitle: 'AirPods & Sony chỉ từ 1.990K',
            cta: 'Mua ngay',
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
            size: 'small'
        },
        {
            id: 4,
            title: 'Loa Bluetooth',
            subtitle: 'Âm thanh đỉnh cao giảm tới 35%',
            cta: 'Săn ngay',
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
            size: 'small'
        },
        {
            id: 5,
            title: 'Tablet Siêu Mỏng',
            subtitle: 'iPad & Samsung Tab từ 4.990K',
            cta: 'Mua ngay',
            image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=500&fit=crop',
            size: 'small'
        },
        {
            id: 6,
            title: 'Phụ Kiện Hot',
            subtitle: 'Ốp lưng, dán màn chỉ từ 99K',
            cta: 'Xem ngay',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
            size: 'small'
        }
    ];



    return (
        <div className="w-full max-w-7xl mx-auto px-10 py-8">
            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Bùng nổ khuyến mãi Black Friday
            </h2>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Column */}
                <div className="md:col-span-3 space-y-10">
                    <DealCard deal={deals[0]} />
                    <DealCard deal={deals[3]} />
                </div>

                {/* Center Column - Large Card */}
                <div className="md:col-span-6">
                    <DealCard deal={deals[1]} large />
                </div>

                {/* Right Column */}
                <div className="md:col-span-3 space-y-10">
                    <DealCard deal={deals[2]} />
                    <DealCard deal={deals[4]} />
                </div>
            </div>
        </div>
    );
}


function DealCard({ deal, large = false }: { deal: any; large?: boolean }) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${large ? 'h-[600px]' : 'h-[280px]'
                }`}
            style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)'
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-between">
                {/* Top Content */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">
                        {deal.title}
                    </h3>
                    <p className={`text-white font-semibold ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                        {deal.subtitle}
                    </p>
                </div>

                {/* CTA Button */}
                <button className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                    {deal.cta}
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl text-red-500/20 font-bold">
                %
            </div>

            {/* BLACK FRIDAY Text */}
            <div className="absolute bottom-8 right-4 text-xs font-bold text-white/30 tracking-wider">
                BLACK FRIDAY
            </div>
        </div>
    );
}