import { ArrowDown, ArrowRight, Check, Headphones, PackageCheck, ShipWheel } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { ProductCard } from "@/components/ProductCard";
import { StoreLayout } from "@/components/StoreLayout";
import { trpc } from "@/providers/trpc";

export default function Home() {
  const [category, setCategory] = useState<string>();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const input = useMemo(() => ({ category, search: deferredSearch || undefined }), [category, deferredSearch]);
  const products = trpc.store.products.useQuery(input);
  const categories = trpc.store.categories.useQuery();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [location.hash]);
  return <StoreLayout>
    <section className="hero"><div className="hero__content">
      <div className="hero__eyebrow"><span className="signal-dot" /> Цифровая навигация · Россия</div>
      <h1>Решения для<br />коммерческого флота<br /><em>и береговых служб</em></h1>
      <p>Оборудование и комплексные системы Sitronics KT для навигации, радиосвязи, автоматизации и подготовки экипажей.</p>
      <a href="#catalog" className="button button--hero">Выбрать оборудование <ArrowDown size={19} /></a>
      <div className="hero__facts"><div><strong>01</strong><span>Разработка<br />и производство</span></div><div><strong>02</strong><span>Поставка<br />и внедрение</span></div><div><strong>03</strong><span>Сервисная<br />поддержка</span></div></div>
    </div><div className="hero__visual">
      <img src="/images/hero-ecosystem.jpg" alt="Морские технологии Sitronics KT" /><div className="hero__grid" aria-hidden="true" />
      <div className="hero__readout"><span>СИСТЕМА / S-KT</span><strong>59°56′ N<br />30°18′ E</strong><small>НАВИГАЦИЯ · СВЯЗЬ · КОНТРОЛЬ</small></div>
      <div className="hero__visual-caption"><ShipWheel size={26} /><span>Единая экосистема<br />морских технологий</span></div>
    </div></section>
    <section className="catalog-section" id="catalog"><div className="container">
      <div className="section-heading"><div><span className="technical-label">КАТАЛОГ / ОБОРУДОВАНИЕ</span><h2>Технологии, которые<br />работают на воде</h2></div><p>Подберите оборудование для своего проекта. Если цена не указана, менеджер рассчитает стоимость по техническому заданию.</p></div>
      <div className="catalog-toolbar"><div className="category-filters" role="group" aria-label="Фильтр по категории"><button className={!category ? "active" : ""} onClick={() => setCategory(undefined)}>Все решения</button>{categories.data?.map((item) => <button key={item.id} className={category === item.slug ? "active" : ""} onClick={() => setCategory(item.slug)}>{item.name}</button>)}</div><label className="search-field"><span className="sr-only">Поиск по каталогу</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Название или артикул" type="search" /></label></div>
      {products.isLoading ? <div className="product-grid" aria-label="Загрузка товаров">{Array.from({ length: 8 }, (_, index) => <div className="product-skeleton" key={index} />)}</div> : products.isError ? <div className="error-state"><h3>Не удалось загрузить каталог</h3><p>Проверьте соединение и попробуйте ещё раз.</p><button className="button button--outline" onClick={() => products.refetch()}>Повторить</button></div> : products.data?.length ? <><div className="catalog-count">Найдено решений: <strong>{products.data.length}</strong></div><div className="product-grid">{products.data.map((product) => <ProductCard product={product} key={product.id} />)}</div></> : <div className="empty-state"><h3>Ничего не найдено</h3><p>Измените запрос или выберите другую категорию.</p><button className="button button--outline" onClick={() => { setSearch(""); setCategory(undefined); }}>Сбросить фильтры</button></div>}
    </div></section>
    <section className="expertise-section" id="expertise"><div className="container expertise-grid"><div className="expertise-intro"><span className="technical-label">ПОЛНЫЙ ЦИКЛ</span><h2>Не просто поставка.<br />Работающий результат.</h2><p>Команда Sitronics KT разрабатывает, производит и внедряет комплексные решения в области цифровой навигации.</p><a href="https://sitronics-kt.ru/company.html" target="_blank" rel="noreferrer" className="text-link">Узнать о компании <ArrowRight size={18} /></a></div><div className="service-list"><div><PackageCheck /><span>01</span><h3>Подбор и комплектация</h3><p>Учитываем тип судна, задачи проекта и требуемую конфигурацию оборудования.</p></div><div><Check /><span>02</span><h3>Внедрение и интеграция</h3><p>Объединяем отдельные системы в согласованный технологический комплекс.</p></div><div><Headphones /><span>03</span><h3>Поддержка и обучение</h3><p>Помогаем с эксплуатацией, документацией и подготовкой специалистов.</p></div></div></div></section>
    <section className="support-section" id="support"><div className="container support-banner"><div><span className="technical-label">ТЕХНИЧЕСКАЯ КОНСУЛЬТАЦИЯ</span><h2>Нужна помощь с выбором?</h2><p>Опишите задачу — инженеры помогут определить состав решения.</p></div><a className="button button--light" href="mailto:sale@sitronics-kt.ru?subject=Консультация по оборудованию">Связаться с инженером <ArrowRight size={18} /></a></div></section>
  </StoreLayout>;
}
