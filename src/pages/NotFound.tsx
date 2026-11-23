import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
export default function NotFound() {
  return <main className="not-found"><img src="/logo.svg" alt="Sitronics KT" /><span>404 / OFF COURSE</span><h1>Страница не найдена</h1><p>Возможно, адрес изменился или товар больше недоступен.</p><Link to="/" className="button button--primary"><ArrowLeft size={18} /> Вернуться на главную</Link></main>;
}
