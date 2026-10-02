import { Outlet } from "react-router-dom";
import Navbar from "../components/Shared/Navbar/Navbar";
import Footer from "../components/Shared/Footer/Footer";
import { CartProvider } from "../components/Shared/Card/CartProvider";
import ScrollToTop from "../components/Shared/ScrollToTop/ScrollToTop";
// import BannerSection from "../components/Shared/BannerSection/BannerSection";

const MainLayout = () => {
  return (
    <CartProvider>
      <div className="bg-white">
        <ScrollToTop />
        <Navbar />
        {/* <BannerSection></BannerSection> */}
        <div className="pt-[90px] md:pt-[120px] min-h-[calc(100vh-68px)] md:pb-0">
          <Outlet />
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default MainLayout;
