import React, { useEffect } from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSeller from "../components/BestSeller";
import BottomBanner from "../components/BottomBanner";
import NewsLetter from "../components/NewsLetter";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import { useAppContext } from "../context/AppContext";

const Home = () => {
  const { getCartItems, user } = useAppContext();

  useEffect(() => {
    if (user) {
      getCartItems();
    }
  });
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <Testimonials />
      <NewsLetter />
    </div>
  );
};

export default Home;
