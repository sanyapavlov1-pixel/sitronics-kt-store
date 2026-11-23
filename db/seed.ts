import { getDb } from "../api/queries/connection";
import { eq } from "drizzle-orm";
import { categories, products } from "./schema";

const base = "/images/products";

async function seed() {
  const db = getDb();
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length) { console.log("Seed skipped: catalog is not empty."); process.exit(0); }
  console.log("Seeding Sitronics KT catalog...");
  const categoryRows = [
    { name: "Навигация и радиосвязь", slug: "navigation-radio", description: "Судовые системы идентификации, навигации и обмена данными.", sortOrder: 10 },
    { name: "Автоматизация судна", slug: "ship-automation", description: "Контроль и управление техническими средствами судна.", sortOrder: 20 },
    { name: "Береговые системы", slug: "onshore-systems", description: "Оборудование береговых служб и функциональных дополнений ГНСС.", sortOrder: 30 },
    { name: "Тренажерные комплексы", slug: "simulators", description: "Технические средства обучения и подготовки специалистов.", sortOrder: 40 },
  ];
  const ids = new Map<string, number>();
  for (const category of categoryRows) {
    const [current] = await db.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
    if (current) ids.set(category.slug, current.id);
    else { const [{ id }] = await db.insert(categories).values(category).$returningId(); ids.set(category.slug, id); }
  }
  await db.insert(products).values([
    {
      categoryId: ids.get("navigation-radio")!, name: "АИС Т104. Класс А", slug: "ais-t104-class-a", sku: "KT-AIS-T104",
      shortDescription: "Автоматическая идентификационная система для повышения безопасности мореплавания.",
      description: "Предназначена для автоматического обмена навигационной, статической и рейсовой информацией между судами и береговыми станциями в открытом море и прибрежных водах.",
      specs: ["Класс А", "Обмен навигационной, статической и рейсовой информацией", "Для судов, на которые распространяются требования SOLAS"],
      imageUrl: `${base}/ais-t104.jpg`, isFeatured: true,
    },
    {
      categoryId: ids.get("navigation-radio")!, name: "АИС Т300", slug: "ais-t300", sku: "KT-AIS-T300",
      shortDescription: "Приёмник автоматической идентификационной системы для маломерных судов и яхт.",
      description: "Обеспечивает приём навигационной, статической и рейсовой информации от судов и береговых станций СУДС, а также данных, касающихся безопасности плавания.",
      specs: ["Приём данных АИС", "Вывод информации на ЭКНИС или пульт отображения", "Для маломерных судов и яхт"],
      imageUrl: `${base}/ais-t300.jpg`, isFeatured: true,
    },
    {
      categoryId: ids.get("navigation-radio")!, name: "АИС Т600. Класс B", slug: "ais-t600-class-b", sku: "KT-AIS-T600",
      shortDescription: "Автоматическая идентификационная система для маломерного флота.",
      description: "Обеспечивает автоматический обмен навигационной, статической и рейсовой информацией и сообщениями безопасности с другими судами и береговыми станциями.",
      specs: ["Класс B", "Для судов вне области применения SOLAS, глава V", "Подходит для рыбопромысловых, пассажирских и рабочих судов"],
      imageUrl: `${base}/ais-t600.jpg`, isFeatured: true,
    },
    {
      categoryId: ids.get("navigation-radio")!, name: "Модем ЦИВ Т500", slug: "civ-modem-t500", sku: "KT-CIV-T500",
      shortDescription: "Модем сигналов цифрового избирательного вызова для комплекса ГМССБ.",
      description: "Предназначен для работы с радиостанциями УКВ и диапазона ПВ/КВ под управлением специализированного программного обеспечения. Служит для приёма и передачи сигналов ЦИВ.",
      specs: ["Работа с УКВ и ПВ/КВ радиостанциями", "Приём и передача сигналов ЦИВ", "Использование в комплексе ГМССБ"], imageUrl: `${base}/civ-t500.jpg`,
    },
    {
      categoryId: ids.get("ship-automation")!, name: "КСУ ТС", slug: "ksu-ts", sku: "KT-KSU-TS",
      shortDescription: "Комплексная система управления техническими средствами судна.",
      description: "Сбор, обработка и отображение информации о работе судовых технических средств, аварийно-предупредительная сигнализация и управление из рулевой рубки и машинного отделения.",
      specs: ["Единое информационное пространство подсистем", "Дистанционный контроль и управление", "Соответствует требованиям РМРС для судов класса AUT-1"],
      imageUrl: `${base}/ksu-ts.jpg`, isFeatured: true,
    },
    {
      categoryId: ids.get("onshore-systems")!, name: "Контрольно-корректирующая станция", slug: "control-correction-station", sku: "KT-KKS-GNSS",
      shortDescription: "Оборудование функциональных дополнений ГНСС для передачи дифференциальных поправок.",
      description: "Формирует и передаёт на суда дифференциальные поправки ГЛОНАСС/GPS по каналам АИС в УКВ-диапазоне в формате VDL для повышения точности определения координат.",
      specs: ["ГЛОНАСС / GPS", "Передача поправок по каналам АИС", "УКВ-диапазон, формат VDL"], imageUrl: `${base}/control-station.jpg`,
    },
    {
      categoryId: ids.get("simulators")!, name: "Тренажер автомобильного крана", slug: "mobile-crane-simulator", sku: "KT-SIM-CRANE",
      shortDescription: "Техническое средство индивидуальной подготовки водителей-крановщиков.",
      description: "Предназначен для отработки погрузочных и разгрузочных работ в безопасной учебной среде.",
      specs: ["Индивидуальная подготовка", "Погрузочные и разгрузочные режимы", "Техническое средство обучения"], imageUrl: `${base}/crane-simulator.jpg`,
    },
    {
      categoryId: ids.get("simulators")!, name: "Навигационный тренажер «Мостик-2000»", slug: "mostik-2000-simulator", sku: "KT-SIM-M2000",
      shortDescription: "Тренажер для подготовки судовых экипажей и отработки управления судном.",
      description: "Предназначен для подготовки экипажей, обеспечения безопасности плавания, выполнения специальных задач и отработки управления судовыми системами.",
      specs: ["Подготовка экипажей судов", "Отработка специальных задач", "Управление энергетической установкой и общесудовыми системами"], imageUrl: `${base}/mostik-2000.jpg`,
    },
  ]);
  console.log("Done: 4 categories, 8 products.");
  process.exit(0);
}

seed().catch((error) => { console.error(error); process.exit(1); });
