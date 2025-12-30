"use client";

import { Card, CardBody } from "@heroui/react";
import {
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconShield,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import { Summary } from "./types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

interface UserStatsProps {
  summary: Summary;
}

const UserStats = ({ summary }: UserStatsProps) => {
  const getRoleCount = (role: string) => {
    const roleData = summary.roleDistribution?.find((r) => r.role === role);
    return roleData?._count || 0;
  };

  return (
    // <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
      {/* Total Users */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <h3 className="text-2xl font-bold">{summary.totalUsers}</h3>
              <p className="text-sm text-gray-500">Registered users</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>

      {/* Active Users */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <h3 className="text-2xl font-bold">{summary.activeUsers}</h3>
              <p className="text-sm text-gray-500">Currently active</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IconUserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>

      {/* Locked Users */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Locked Users
              </p>
              <h3 className="text-2xl font-bold">{summary.lockedUsers}</h3>
              <p className="text-sm text-gray-500">Accounts locked</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <IconUserX className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>

      {/* Admin Users */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              <h3 className="text-2xl font-bold">{getRoleCount("ADMIN")}</h3>
              <p className="text-sm text-gray-500">Administrators</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <IconShield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>

      {/* Managers */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Managers
              </p>
              <h3 className="text-2xl font-bold">{getRoleCount("MANAGER")}</h3>
              <p className="text-sm text-gray-500">Team managers</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <IconShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>

      {/* Staff */}
      <SwiperSlide>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Staff</p>
              <h3 className="text-2xl font-bold">
                {getRoleCount("STAFF") + getRoleCount("VIEWER")}
              </h3>
              <p className="text-sm text-gray-500">Regular users</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <IconUser className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardBody>
        </Card>
      </SwiperSlide>
      {/* </div> */}
    </Swiper>
  );
};

export default UserStats;
