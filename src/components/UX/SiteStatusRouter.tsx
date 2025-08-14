import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

interface SiteStatusRouterProps {
   children: React.ReactNode;
}

// Список страниц админ-панели, которые должны быть доступны даже при выключенном сайте
const adminRoutes = [
   "/admin",
   "/admin-orders",
   "/admin-reports",
   "/admin-users",
   "/admin-accounts",
   "/admin-sections",
   "/admin-site-switch"
];

const SiteStatusRouter = ({ children }: SiteStatusRouterProps) => {
   const [isSiteEnabled, setIsSiteEnabled] = useState<boolean | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const location = useLocation();

   // Проверяем права пользователя
   const storedUser = localStorage.getItem("user");
   const user = storedUser ? JSON.parse(storedUser) : null;
   const isAdmin = user && (user.role === "admin" || user.role === "moder");

   // Текущий путь
   const currentPath = location.pathname;

   // Проверяем, является ли текущий путь маршрутом админ-панели
   const isAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));

   useEffect(() => {
      const fetchSiteStatus = async () => {
         try {
            // Попытка получить статус с сервера
            const response = await axios.get("http://62.169.27.192/api/site-status");
            const status = response.data.enabled;

            // Сохраняем статус в localStorage для быстрого доступа
            localStorage.setItem("siteStatus", status ? "enabled" : "disabled");

            setIsSiteEnabled(status);
         } catch (error) {
            console.error("Ошибка при получении статуса сайта:", error);

            // Если не удалось получить статус с сервера, используем значение из localStorage
            const localStatus = localStorage.getItem("siteStatus");
            setIsSiteEnabled(localStatus !== "disabled"); // По умолчанию сайт включен
         } finally {
            setIsLoading(false);
         }
      };

      fetchSiteStatus();
   }, []);

   // Показываем загрузку, пока не получим статус сайта
   if (isLoading) {
      return <div>Загрузка...</div>;
   }

   // Если сайт выключен и текущий маршрут не админский или пользователь не админ/модер
   if (!isSiteEnabled && (!isAdminRoute || !isAdmin)) {
      return <Navigate to="/404error" replace />;
   }

   // В противном случае отображаем запрошенный компонент
   return <>{children}</>;
};

export default SiteStatusRouter;