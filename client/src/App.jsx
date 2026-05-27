import {Routes, Route} from "react-router-dom";
import Homepage from "./pages/Homepage.jsx"
import AuthPages from "./pages/AuthPages.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminPage from "./pages/Adminpage.jsx";
import CheckoutPage from "./pages/Checkoutpage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path= "/login" element={<AuthPages/>}/>
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
       <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;