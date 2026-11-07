import {
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react"
import type { NavGroup } from "@/components/layout/navigation.types"

// Dashboard navigation. Mark a link `disabled` until its screens exist; remove the flag when shipping it.
export const dashboardNavigation: NavGroup[] = [
  {
    items: [{ title: "لوحة التحكم", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "المتجر",
    items: [
      {
        title: "المنتجات",
        icon: Package,
        items: [
          { title: "كل المنتجات", href: "/catalog/products" },
          { title: "التصنيفات", href: "/catalog/categories" },
        ],
      },
      { title: "الطلبات", href: "/sales/orders", icon: ShoppingCart, disabled: true },
      { title: "الزبائن", href: "/sales/customers", icon: Users, disabled: true },
    ],
  },
  {
    label: "المخزون والمشتريات",
    items: [
      { title: "المخزون", href: "/inventory", icon: Warehouse, disabled: true },
      { title: "فواتير الشراء", href: "/purchasing/invoices", icon: ReceiptText },
      { title: "الموردون", href: "/purchasing/suppliers", icon: Truck },
    ],
  },
  {
    items: [
      {
        title: "المالية",
        icon: Wallet,
        items: [
          { title: "المحافظ", href: "/finance/wallets", disabled: true },
          { title: "المصاريف", href: "/finance/expenses", disabled: true },
          { title: "أسعار الصرف", href: "/finance/exchange-rates", disabled: true },
          { title: "التقارير", href: "/finance/reports", disabled: true },
        ],
      },
    ],
  },
]
