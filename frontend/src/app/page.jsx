import Header from "./componats/Header";
import Footer from "./componats/Footer";
import Slider from "./componats/Slider";
import Category from "./componats/Category";
import PromotinalBanner from "./componats/PromotinalBanner";
import RoundecPromotianalBanner from "./componats/RoundecPromotianalBanner";
import WhyChoose from "./componats/WhyChoose";
import HomeVideo from "./componats/HomeVideo";
import Testimonial from "./componats/Testimonial";
import FeaturesBanner from "./componats/FeaturesBanner";
import RecentlyViewed from "./componats/RecentlyViewed";
import NewArrivals from "./componats/NewArrivals";
import AllProductsHome from "./componats/allproducts";
import CategoryShowcase from "./componats/categoryshowcase";

export default function Home() {
  return (
    <div className="">
     <Header />
      <Slider />
      <Category />
      <PromotinalBanner />
      <RecentlyViewed />
      <RoundecPromotianalBanner img="banner/bg2.jpg" />
      <NewArrivals />
      <WhyChoose />
      <AllProductsHome/>
      <CategoryShowcase/>
      <HomeVideo />
      <Testimonial /> 
      {/* <FeaturesBanner /> */}
     <Footer />   
    </div>
  );
}
