// page.tsx
import Banner from "@/components/banners/Banner";
import HeroBannerSlider from "@/components/banners/Slider";
import CategoryGrid from "@/components/categories/CategoryGrid";
import PaymentPromotions from "@/components/payments/PaymentSection";
import SuggestedPosts from "@/components/posts.tsx/SuggestPost";
import FlashSale from "@/components/products/FlashSale";
import SuggestedProducts from "@/components/products/SuggestProduct";
import SuggestedAccessories from "@/components/products/SuggestProduct2";
import BlackFridayDeals from "@/components/ui/BlackFridaySection";
import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { AutoHideHeader } from "@/components/ui/AutoHideHeader";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

export default function Home() {
    return (
        <div>
            {/* Header với hiệu ứng auto-hide */}
            <AutoHideHeader>
                <Header />
            </AutoHideHeader>
            
            {/* Thêm padding-top để nội dung không bị header che */}
            <div className="bg-[#F3F4F6] pt-20">
                <HeroBannerSlider />
                <CategoryGrid />
                <FlashSale />
                <SuggestedProducts />
                <Banner />
                <SuggestedAccessories />
                <BlackFridayDeals />
                <SuggestedPosts />
                <PaymentPromotions />
            </div>
            
            <Footer />
            
            {/* Nút Back to Top */}
            <ScrollToTopButton />
        </div>
    );
}