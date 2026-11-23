import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";

export function StoreLayout({ children }: { children: ReactNode }) {
  const { count, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <div className="store-shell">
    <div className="utility-bar"><div className="container utility-bar__inner"><span>АО «Ситроникс КТ»</span><span className="utility-bar__location">Санкт-Петербург · Москва</span><div><a href="tel:+78124499090">+7 (812) 449-90-90</a><a href="mailto:sale@sitronics-kt.ru">sale@sitronics-kt.ru</a></div></div></div>
    <header className="site-header"><div className="container site-header__inner">
      <Link to="/" className="brand-logo" aria-label="Sitronics KT — на главную"><img src="/logo.svg" alt="Sitronics KT" /></Link>
      <nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Основная навигация">
        <Link to="/#catalog">Каталог</Link><Link to="/#expertise">Компетенции</Link><Link to="/#support">Поддержка</Link><Link to="/#contacts">Контакты</Link>
      </nav>
      <div className="site-header__actions"><button className="cart-button" onClick={() => setIsOpen(true)} aria-label={`Открыть корзину, товаров: ${count}`}><ShoppingBag size={20} /><span>Корзина</span><b>{count}</b></button><button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div></header>
    <main>{children}</main>
    <footer className="site-footer" id="contacts"><div className="container">
      <div className="site-footer__top"><div><img src="/logo.svg" alt="Sitronics KT" /><p>Решения для коммерческого флота<br />и береговых служб</p></div><div className="site-footer__contact"><span>Коммерческий блок</span><a href="tel:+74957483580">+7 (495) 748-35-80</a><a href="mailto:sale@sitronics-kt.ru">sale@sitronics-kt.ru</a></div></div>
      <div className="site-footer__links"><div><strong>Магазин</strong><Link to="/#catalog">Каталог оборудования</Link><Link to="/checkout">Оформить заявку</Link><Link to="/admin">Панель администратора</Link></div><div><strong>Компания</strong><a href="https://sitronics-kt.ru/company.html" target="_blank" rel="noreferrer">О Sitronics KT</a><a href="https://sitronics-kt.ru/documentation.html" target="_blank" rel="noreferrer">Документация</a><a href="https://sitronics-kt.ru/news.html" target="_blank" rel="noreferrer">Новости</a></div><div><strong>Мы на связи</strong><a href="https://vk.com/sitronics_kt" target="_blank" rel="noreferrer">ВКонтакте</a><a href="https://t.me/sitronics_kt" target="_blank" rel="noreferrer">Telegram</a><a href="https://rutube.ru/channel/44271124/" target="_blank" rel="noreferrer">Rutube</a></div></div>
      <div className="site-footer__bottom"><span>© {new Date().getFullYear()} Sitronics KT</span><span>Цены и наличие подтверждаются менеджером</span></div>
    </div></footer>
    <CartDrawer />
  </div>;
}
