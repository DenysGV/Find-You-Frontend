import { useState, useEffect } from "react";
import axios from "axios";
import SuccessModal from "../../UX/modals/SuccessModal";
import ErrorModal from "../../UX/modals/ErrorModal";
import Title from "../../UX/Title";

const AdminSiteSwitch = () => {
   const [isSiteEnabled, setIsSiteEnabled] = useState<boolean>(true);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>("");
   const [successMessage, setSuccessMessage] = useState<string>("");

   // URL для API запросов
   const apiUrl = "http://localhost:5000/site-status";

   // Проверяем права пользователя
   const storedUser = localStorage.getItem("user");
   const user = storedUser ? JSON.parse(storedUser) : null;
   const isAdmin = user && user.role === "admin"; // Только админ может менять статус

   // Получаем текущий статус сайта при загрузке компонента
   useEffect(() => {
      const fetchSiteStatus = async () => {
         try {
            const response = await axios.get(apiUrl);
            setIsSiteEnabled(response.data.enabled);
            setIsLoading(false);
         } catch (error) {
            console.error("Ошибка при получении статуса сайта:", error);
            // Если не удалось получить статус с сервера, проверяем локальное хранилище
            const localStatus = localStorage.getItem("siteStatus");
            setIsSiteEnabled(localStatus === "enabled" || localStatus === null); // По умолчанию включен
            setIsLoading(false);
         }
      };

      fetchSiteStatus();
   }, []);

   // Обработчик изменения статуса сайта
   const handleToggleSiteStatus = async () => {
      if (!isAdmin || !user) {
         setErrorMessage("У вас нет прав для изменения статуса сайта");
         setIsErrorModalOpen(true);
         return;
      }

      try {
         setIsLoading(true);

         // Отправляем запрос на сервер для изменения статуса, включая логин пользователя
         const newStatus = !isSiteEnabled;
         const response = await axios.post(apiUrl, {
            enabled: newStatus,
            login: user.login  // Передаем логин для проверки прав на сервере
         });

         if (response.data.success) {
            // Обновляем локальное хранилище
            localStorage.setItem("siteStatus", newStatus ? "enabled" : "disabled");

            // Обновляем состояние
            setIsSiteEnabled(newStatus);

            // Показываем уведомление об успехе
            setSuccessMessage(
               newStatus
                  ? "Сайт успешно включен и доступен для пользователей"
                  : "Сайт выключен и перешел в режим технического обслуживания"
            );
            setIsSuccessModalOpen(true);
         } else {
            throw new Error(response.data.error || "Неизвестная ошибка");
         }
      } catch (error: any) {
         console.error("Ошибка при изменении статуса сайта:", error);
         setErrorMessage(
            error.response?.data?.error || "Ошибка при изменении статуса сайта"
         );
         setIsErrorModalOpen(true);
      } finally {
         setIsLoading(false);
      }
   };

   // Если пользователь не админ, не показываем компонент
   if (!isAdmin) {
      return null;
   }

   return (
      <div className="admin-site-switch">
         <Title>Отображение контента</Title>

         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>

         <div className="admin-site-switch__content">
            <div className="site-status-card">
               <h3>Текущий статус сайта</h3>
               <div className="site-status-indicator">
                  {isLoading ? (
                     <span>Загрузка...</span>
                  ) : (
                     <div className={`status-badge ${isSiteEnabled ? "enabled" : "disabled"}`}>
                        {isSiteEnabled ? "Включен" : "Выключен (режим обслуживания)"}
                     </div>
                  )}
               </div>

               <div className="site-status-description">
                  {isSiteEnabled
                     ? "Сайт доступен для всех пользователей"
                     : "Сайт находится в режиме технического обслуживания. Только администраторы имеют доступ к админ-панели."}
               </div>

               <button
                  className={`btn ${isSiteEnabled ? "site-status__enable" : "site-status__disable"}`}
                  onClick={handleToggleSiteStatus}
                  disabled={isLoading}
               >
                  {isLoading
                     ? "Загрузка..."
                     : (isSiteEnabled ? "Выключить сайт" : "Включить сайт")}
               </button>
            </div>
         </div>
      </div>
   );
};

export default AdminSiteSwitch;