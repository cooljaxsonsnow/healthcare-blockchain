import { Link } from "react-router-dom";
import AboutUs from "../components/home/aboutUs";
import ContactUs from "../components/home/contactUs";
import LandingPage from "../components/home/landingPage";
import Services from "../components/home/services";
import Footer from "./footer";

function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* <header className="bg-white shadow-sm">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex-shrink-0">
                                <a href="#" className="font-bold text-xl text-indigo-500">Healthcare Record Platform</a>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <a href="#" className="text-gray-500 hover:text-gray-700 font-medium">Home</a>
                                    <a href="#" className="text-gray-500 hover:text-gray-700 font-medium">Features</a>
                                    <a href="#" className="text-gray-500 hover:text-gray-700 font-medium">About Us</a>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header> */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"></main>
        <footer className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-4 flex flex-col justify-center items-center">
            <p className="text-base leading-6 text-gray-500">
              © 2024 Healthcare Record Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;
