import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactSec from './components/contactSection';
import TabbedServices from './components/AllServices';
import AdminLogin from './Pages/AdminLogin';
import AdminBlogs from './Pages/AdminBlogs';
import AdminProjects from './Pages/AdminProjects';
import Blogs from './Pages/Blogs';
import BlogDetail from './Pages/Blogdetail';
import ProtectedRoute from './components/ProtectedRoutes';

// Lazy-loaded pages
const HomePage = lazy(() => import('./Pages/HomePage'));
const AboutPage = lazy(() => import('./Pages/AboutPg'));
const DM = lazy(() => import('./Pages/DigitalMarketting'));
const Web_dev = lazy(() => import('./Pages/Web-devPg'));
const ProductionHouse = lazy(() => import('./Pages/ProductionHouse'));
const PodcastStudio = lazy(() => import('./Pages/PodcastStudio'));
const Projects = lazy(() => import('./Pages/Projects'));
const Reviews = lazy(() => import('./Pages/Reviews'));


// 🔥 Force scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
   
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll AFTER render
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);

  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>

     
      <ScrollToTop />

      <Header />

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/digital_marketing" element={<DM />} />
          <Route path="/web_development" element={<Web_dev />} />
          <Route path="/production_house" element={<ProductionHouse />} />
          <Route path="/podcast_studio" element={<PodcastStudio />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<ContactSec />} />
          <Route path="/services" element={<TabbedServices />} />
           <Route path="/admin" element={<AdminLogin />} />

          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute>
                <AdminBlogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjects />
              </ProtectedRoute>
            }
          />

           <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/*" element={<BlogDetail />} />   
           
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

