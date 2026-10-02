import { Helmet } from "react-helmet-async";
import Products from "../../components/Home/Products";
import Banner from "../../components/Shared/Banner/Banner";
import MainBodyComponent from "../../components/Shared/MainBodyComponent/MainBodyComponent";

const Home = () => {
  return (
    <div className="">
      <Helmet>
        <title> Web Developer Bangladesh</title>
      </Helmet>
      <div>
        <Banner></Banner>
      </div>
      <Products></Products>
      <div>
        <MainBodyComponent></MainBodyComponent>
      </div>
    </div>
  );
};

export default Home;
