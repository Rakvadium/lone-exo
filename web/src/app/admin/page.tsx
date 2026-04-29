"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { DollarSign, Package, Users, AlertTriangle, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const user = useQuery(api.users.current);
  const stats = useQuery(api.admin.getDashboardStats);
  const recentOrders = useQuery(api.admin.getRecentOrders, { limit: 5 });
  const lowStock = useQuery(api.admin.getLowStockProducts);

  if (user === null) {
    router.push("/auth/signin");
    return null;
  }

  if (user && user.role !== "admin") {
    router.push("/");
    return null;
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : null,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Monthly Revenue",
      value: stats ? formatPrice(stats.monthlyRevenue) : null,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-500",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders,
      icon: Package,
      color: "text-yellow-500",
    },
    {
      title: "Total Customers",
      value: stats?.totalUsers,
      icon: Users,
      color: "text-indigo-500",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount,
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-4xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/products"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/admin/inventory"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Inventory
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {stat.value !== null && stat.value !== undefined ? (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders === undefined ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.userName} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatPrice(order.total)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStock === undefined ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : lowStock.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    All products are well stocked
                  </p>
                ) : (
                  <div className="space-y-4">
                    {lowStock.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between"
                      >
                        <p className="font-medium text-sm">
                          {item.productName}
                        </p>
                        <Badge
                          variant={
                            item.availableStock <= 0 ? "destructive" : "warning"
                          }
                        >
                          {item.availableStock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
