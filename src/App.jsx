import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/auth_Context.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/HomePage.jsx';
import Listings from './components/Listingpage_With_Fillter.jsx';
import ListingDetail from './components/Listing_Details.jsx';
import Contact from './components/Contact.jsx';
import About from './components/About.jsx';
import Blog from './components/Blog.jsx';
import BlogDetail from './components/BlogDetail.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import Terms from './components/Terms.jsx';
import Privacy from './components/Privacy.jsx';
import PrivateRoute from './components/privateRoutes.jsx';
import Profile from './components/Profile.jsx';
import CreateListing from './components/CreateListing.jsx';
import AdminRoute from './admin/AdminRoute.jsx';
import AdminPanel from './admin/AdminPanel.jsx';
import AdminSignIn from './admin/AdminSignIn.jsx';
import AdminSignUp from './admin/AdminSignUp.jsx';

// Component that automatically scrolls to the very top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}