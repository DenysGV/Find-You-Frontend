import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Access from "./pages/Access";
import Cities from "./pages/Cities";
import Delete from "./pages/Delete";
import Tags from "./pages/Tags";
import Recovery from "./pages/Recovery";
import Registration from "./pages/Registration";
import AccountPage from "./pages/AccountPage";
import Order from "./pages/Order";
import Favorites from "./pages/Favorites";
import Comments from "./pages/Comments";
import About from "./pages/About";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";
import Mirrors from "./pages/Mirrors";
import Referral from "./pages/Referral";
import Refusual from "./pages/Refusual";
import useSecurityRestrictions from "./utils/useSecurity";
import Bypassing from "./pages/Bypassing";
import AdminOrders from "./pages/AdminOrders";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminAccounts from "./pages/AdminAccounts";
import AdminSections from "./pages/AdminSections";
import { useEffect } from "react";
import { startSessionChecker, stopSessionChecker } from "./utils/userSessionChecker";
import UserUpdateListener from "./components/Admin/UserUpdateListener";
import NotFound from "./pages/NotFound";
import AdminSiteSwitchPage from "./pages/AdminSiteSwitchPage";
import SiteStatusRouter from "./components/UX/SiteStatusRouter";
import Success from "./pages/Success";
import Failed from "./pages/Failed";


const App = () => {
   useSecurityRestrictions(); // Вызываем хук внутри компонента

   // Запускаем проверку сессии при монтировании приложения
   useEffect(() => {
      // Проверяем, авторизован ли пользователь
      const token = localStorage.getItem('token');
      if (token) {
         // Запускаем проверку сессии
         startSessionChecker();
      }

      // Слушаем события входа
      const handleStorageUpdated = () => {
         // Запускаем проверку сессии при входе в систему
         startSessionChecker();
      };

      // Добавляем слушатель события
      window.addEventListener('storage-updated', handleStorageUpdated);

      // Очищаем слушатель и останавливаем проверку при размонтировании
      return () => {
         window.removeEventListener('storage-updated', handleStorageUpdated);
         stopSessionChecker();
      };
   }, []);

   return (
      <BrowserRouter>
         <UserUpdateListener />
         <Routes>
            {/* Страница 404 всегда доступна */}
            <Route path="/404error" element={<NotFound />} />

            {/* Административные маршруты доступны для админов даже при выключенном сайте */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-orders" element={<AdminOrders />} />
            <Route path="/admin-reports" element={<AdminReports />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-accounts" element={<AdminAccounts />} />
            <Route path="/admin-sections" element={<AdminSections />} />
            <Route path="/admin-site-switch" element={<AdminSiteSwitchPage />} />

            {/* Публичные маршруты, которые будут перенаправлены на 404 при выключенном сайте */}
            <Route
               path="/"
               element={
                  <SiteStatusRouter>
                     <Home />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/access"
               element={
                  <SiteStatusRouter>
                     <Access />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/cities"
               element={
                  <SiteStatusRouter>
                     <Cities />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/tags"
               element={
                  <SiteStatusRouter>
                     <Tags />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/order"
               element={
                  <SiteStatusRouter>
                     <Order />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/delete"
               element={
                  <SiteStatusRouter>
                     <Delete />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/mirrors"
               element={
                  <SiteStatusRouter>
                     <Mirrors />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/about"
               element={
                  <SiteStatusRouter>
                     <About />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/referral"
               element={
                  <SiteStatusRouter>
                     <Referral />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/refusual"
               element={
                  <SiteStatusRouter>
                     <Refusual />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/bypassing"
               element={
                  <SiteStatusRouter>
                     <Bypassing />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/recovery"
               element={
                  <SiteStatusRouter>
                     <Recovery />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/registration"
               element={
                  <SiteStatusRouter>
                     <Registration />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/favorites"
               element={
                  <SiteStatusRouter>
                     <Favorites />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/comments"
               element={
                  <SiteStatusRouter>
                     <Comments />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/messages"
               element={
                  <SiteStatusRouter>
                     <Messages />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/success"
               element={
                  <SiteStatusRouter>
                     <Success />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/failed"
               element={
                  <SiteStatusRouter>
                     <Failed />
                  </SiteStatusRouter>
               }
            />
            <Route
               path="/:accountId"
               element={
                  <SiteStatusRouter>
                     <AccountPage />
                  </SiteStatusRouter>
               }
            />

            {/* Перенаправление всех несуществующих маршрутов на страницу 404 */}
            <Route path="*" element={<NotFound />} />
         </Routes>
      </BrowserRouter>
   );
};

export default App;
