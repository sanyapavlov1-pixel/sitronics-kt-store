export const availabilityLabels = { in_stock: "В наличии", on_order: "Под заказ", out_of_stock: "Нет в наличии" } as const;
export const orderStatusLabels = { new: "Новый", processing: "В работе", quoted: "Счёт выставлен", completed: "Завершён", cancelled: "Отменён" } as const;

export function formatPrice(value: string | number | null | undefined, currency = "RUB") {
  if (value === null || value === undefined || value === "") return "По запросу";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function slugify(value: string) {
  const map: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
  return value.toLowerCase().split("").map((char) => map[char] ?? char).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 190);
}
