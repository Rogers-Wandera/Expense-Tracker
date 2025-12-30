"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  IconReceipt,
  IconUsers,
  IconCheck,
  IconClock,
  IconTrendingUp,
  IconCurrencyDollar,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { Card, CardBody } from "@heroui/react";

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  trend: "up" | "down" | "neutral";
}

interface StatsCarouselProps {
  stats: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    pendingAmount: number;
    pendingCount: number;
    approvedAmount: number;
    approvedCount: number;
    paidAmount: number;
    paidCount: number;
    totalUsers: number;
  };
}

export function StatsCarousel({ stats }: StatsCarouselProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format UGX currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `UGX ${(amount / 1000).toFixed(0)}K`;
    }
    return `UGX ${amount.toFixed(0)}`;
  };

  const statCards: StatCard[] = [
    {
      id: "total",
      title: "Total Expenses",
      value: formatCurrency(stats.totalAmount),
      change: 12.5,
      icon: <IconReceipt className="w-5 h-5" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      description: `${stats.totalCount} expenses`,
      trend: "up",
    },
    {
      id: "average",
      title: "Avg. Expense",
      value: formatCurrency(stats.averageAmount),
      change: -3.2,
      icon: <IconTrendingUp className="w-5 h-5" />,
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
      description: "Per transaction",
      trend: "down",
    },
    {
      id: "pending",
      title: "Pending",
      value: formatCurrency(stats.pendingAmount),
      change: 8.7,
      icon: <IconClock className="w-5 h-5" />,
      color: "bg-gradient-to-br from-amber-500 to-yellow-500",
      description: `${stats.pendingCount} pending`,
      trend: "up",
    },
    {
      id: "approved",
      title: "Approved",
      value: formatCurrency(stats.approvedAmount),
      change: 15.3,
      icon: <IconCheck className="w-5 h-5" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      description: `${stats.approvedCount} approved`,
      trend: "up",
    },
    {
      id: "paid",
      title: "Paid",
      value: formatCurrency(stats.paidAmount),
      change: 24.1,
      icon: <IconCurrencyDollar className="w-5 h-5" />,
      color: "bg-gradient-to-br from-purple-500 to-violet-600",
      description: `${stats.paidCount} paid`,
      trend: "up",
    },
    {
      id: "users",
      title: "Active Users",
      value: stats.totalUsers,
      change: 5.2,
      icon: <IconUsers className="w-5 h-5" />,
      color: "bg-gradient-to-br from-indigo-500 to-blue-600",
      description: "Registered users",
      trend: "up",
    },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardBody className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        className="pb-10"
      >
        {statCards.map((stat) => (
          <SwiperSlide key={stat.id}>
            <Card className="h-full group hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
              <CardBody className="p-5">
                {/* Top row: Icon and change indicator */}
                <div className="flex items-start justify-between mb-4">
                  {/* Icon */}
                  <div
                    className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <div className="text-white">{stat.icon}</div>
                  </div>

                  {/* Change indicator */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend === "up"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : stat.trend === "down"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <IconArrowUpRight className="w-3 h-3" />
                    ) : stat.trend === "down" ? (
                      <IconArrowDownRight className="w-3 h-3" />
                    ) : null}
                    <span>{stat.change}%</span>
                  </div>
                </div>

                {/* Main content */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>

                {/* Bottom progress indicator */}
                <div className="mt-4">
                  <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.id === "total"
                          ? "w-85 bg-linear-to-r from-blue-500 to-blue-600"
                          : stat.id === "average"
                          ? "w-60 bg-linear-to-r from-emerald-500 to-green-600"
                          : stat.id === "pending"
                          ? "w-45 bg-linear-to-r from-amber-500 to-yellow-500"
                          : stat.id === "approved"
                          ? "w-70 bg-linear-to-r from-green-500 to-emerald-600"
                          : stat.id === "paid"
                          ? "w-90 bg-linear-to-r from-purple-500 to-violet-600"
                          : "w-55 bg-linear-to-r from-indigo-500 to-blue-600"
                      }`}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
