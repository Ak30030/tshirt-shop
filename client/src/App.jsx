import {Routes, Route} from "react-router-dom";
import AuthPages from "./pages/AuthPages.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPages />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
}

export default App;