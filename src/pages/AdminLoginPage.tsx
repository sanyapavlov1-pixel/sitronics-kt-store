import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";

export default function AdminLoginPage() {
  const me = trpc.admin.me.useQuery();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const login = trpc.admin.login.useMutation({
    onSuccess: async () => { await me.refetch(); navigate("/admin", { replace: true }); },
    onError: (result) => setError(result.message),
  });
  if (me.isLoading) return <div className="admin-loading">Проверяем сессию…</div>;
  if (me.data) return <Navigate to="/admin" replace />;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    login.mutate({ email: String(data.get("email")), password: String(data.get("password")) });
  }
  return <main className="admin-login"><section className="admin-login__brand"><Link to="/"><ArrowLeft size={17} /> Вернуться в магазин</Link><div><img src="/logo.svg" alt="Sitronics KT" /><span>УПРАВЛЕНИЕ / S-KT</span><h1>Каталог и заказы<br />в одном месте.</h1><p>Защищённая панель для менеджеров интернет-магазина.</p></div><small>SITRONICS KT · MARINE TECHNOLOGIES</small></section><section className="admin-login__form"><form onSubmit={submit}><LockKeyhole size={32} strokeWidth={1.4} /><span className="technical-label">ДОСТУП АДМИНИСТРАТОРА</span><h2>Вход в панель</h2><p>Используйте учётные данные, заданные в настройках сервера.</p><label>Email<input name="email" type="email" required autoComplete="username" placeholder="admin@sitronics-kt.ru" /></label><label>Пароль<input name="password" type="password" required minLength={8} autoComplete="current-password" placeholder="Введите пароль" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button--primary button--wide" disabled={login.isPending}>{login.isPending ? "Проверяем…" : "Войти"}</button></form></section></main>;
}
