import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoutes';
import SEO from './components/SEO';
import { metaForRoute } from './seo/routeMeta';

// Every route is code-split. The admin panel in particular drags in the TipTap
// rich-text editor (~450 kB of ProseMirror) which no public visitor ever needs,
// and the blog pages pull in DOMPurify — keeping those static made the initial
// bundle ~790 kB for everyone.
const HomePage = lazy(() => import('./Pages/HomePage'));
const AboutPage = lazy(() => import('./Pages/AboutPg'));
const DM = lazy(() => import('./Pages/DigitalMarketting'));
const Web_dev = lazy(() => import('./Pages/Web-devPg'));
const ProductionHouse = lazy(() => import('./Pages/ProductionHouse'));
const PodcastStudio = lazy(() => import('./Pages/PodcastStudio'));
const Projects = lazy(() => import('./Pages/Projects'));
const Reviews = lazy(() => import('./Pages/Reviews'));
const ContactSec = lazy(() => import('./components/contactSection'));
const TabbedServices = lazy(() => import('./components/AllServices'));
const Blogs = lazy(() => import('./Pages/Blogs'));
const BlogDetail = lazy(() => import('./Pages/Blogdetail'));
const AdminLogin = lazy(() => import('./Pages/AdminLogin'));
const AdminBlogs = lazy(() => import('./Pages/AdminBlogs'));
const AdminProjects = lazy(() => import('./Pages/AdminProjects'));

/**
 * Pairs a route element with its metadata.
 *
 * The <SEO> tag lives here rather than inside each page because two of these
 * "pages" are not only pages: `contactSection` renders as /contact AND as a
 * block inside the home, projects and reviews pages, and `AllServices` renders
 * as /services AND as a block on the home page. A <SEO> tag inside either of
 * them would retitle whichever page had embedded it. Declaring the metadata
 * beside the route makes that mistake impossible, and keeps all six routes
 * visible in one screenful.
 *
 * A path with no entry in the table renders exactly as before, with no <SEO>
 * tag at all, so the routes not in scope here are untouched.
 */
function Seo({ path, children }) {
  const meta = metaForRoute(path);
  return (
    <>
      {meta && <SEO title={meta.title} description={meta.description} canonical={meta.canonical} />}
      {children}
    </>
  );
}

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
    <HelmetProvider>
      <BrowserRouter>

      <ScrollToTop />

      <Header />

      {/* The single <main> landmark for every route. Pages must not render
          their own <main> — nested/duplicate main landmarks are invalid and
          fail the accessibility tree audits. */}
      {/* `flow-root` establishes a block formatting context so a route's first
          element cannot collapse its top margin out through <main> and <body>.
          That collapse changed the body's position the moment the lazy route
          chunk replaced the Suspense fallback, which registered as a layout
          shift on every interior page. It has no visual effect. */}
      <main id="main-content" style={{ display: 'flow-root' }}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Seo path="/"><HomePage /></Seo>} />
            <Route path="/about" element={<Seo path="/about"><AboutPage /></Seo>} />
            <Route path="/digital_marketing" element={<DM />} />
            <Route path="/web_development" element={<Web_dev />} />
            <Route path="/production_house" element={<ProductionHouse />} />
            <Route path="/podcast_studio" element={<PodcastStudio />} />
            <Route path="/projects" element={<Seo path="/projects"><Projects /></Seo>} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Seo path="/contact"><ContactSec isPage /></Seo>} />
            <Route path="/services" element={<Seo path="/services"><TabbedServices headingLevel="h1" /></Seo>} />
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

            <Route path="/blogs" element={<Seo path="/blogs"><Blogs /></Seo>} />
            <Route path="/blog/*" element={<BlogDetail />} />

          </Routes>
        </Suspense>
      </main>

      <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
