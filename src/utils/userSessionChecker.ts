import axios from 'axios';

// Интервал проверки сессии в миллисекундах (каждые 30 секунд)
const SESSION_CHECK_INTERVAL = 30000;

// Хранит идентификатор таймера для очистки при выходе из аккаунта
let sessionCheckInterval: NodeJS.Timeout | null = null;

// Функция для проверки сессии и обновления данных пользователя
export const startSessionChecker = () => {
   // Очищаем предыдущий интервал, если он есть
   if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
   }

   // Создаем новый интервал
   sessionCheckInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (!token) {
         stopSessionChecker();
         return;
      }

      try {
         const response = await axios.get('https://check-you.blog/api/check-user-session', {
            headers: {
               Authorization: `Bearer ${token}`
            }
         });

         // Обновляем данные пользователя в localStorage
         if (response.data.user) {
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

            // Если данные пользователя изменились, обновляем их
            if (JSON.stringify(currentUser) !== JSON.stringify(response.data.user)) {
               localStorage.setItem('user', JSON.stringify(response.data.user));

               // Отправляем событие об обновлении данных
               window.dispatchEvent(new Event('user-updated'));
            }
         }
      } catch (error: any) {
         // Если сессия истекла или токен невалидный
         if (error.response && (error.response.status === 401 || error.response.data.sessionExpired)) {
            // Обрабатываем истечение сессии
            handleSessionExpired();
         }
      }
   }, SESSION_CHECK_INTERVAL);
};

// Функция для остановки проверки сессии
export const stopSessionChecker = () => {
   if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
   }
};

// Обработка истечения сессии
const handleSessionExpired = () => {
   // Очищаем localStorage
   localStorage.removeItem('token');
   localStorage.removeItem('user');

   // Останавливаем проверку сессии
   stopSessionChecker();

   // Отправляем событие о выходе из системы
   window.dispatchEvent(new Event('user-logged-out'));

   // Перенаправляем на главную страницу
   window.location.href = '/';
};

// Функция для принудительного обновления данных пользователя (можно вызывать при необходимости)
export const refreshUserData = async (): Promise<boolean> => {
   const token = localStorage.getItem('token');
   if (!token) return false;

   try {
      const response = await axios.get('https://check-you.blog/api/check-user-session', {
         headers: {
            Authorization: `Bearer ${token}`
         }
      });

      if (response.data.user) {
         localStorage.setItem('user', JSON.stringify(response.data.user));
         window.dispatchEvent(new Event('user-updated'));
         return true;
      }
      return false;
   } catch (error) {
      return false;
   }
};