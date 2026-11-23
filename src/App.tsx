import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
