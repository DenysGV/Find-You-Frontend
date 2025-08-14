import axios from 'axios';

const api = axios.create({
   baseURL: 'http://62.169.27.192/api',
   headers: { 'Content-Type': 'application/json' }
});

// Перехватчик ошибок
api.interceptors.response.use(
   response => response,  // Если ответ нормальный — просто возвращаем
   async error => {
      const originalRequest = error.config;

      // Если ошибка 401 и нет retry, пробуем обновить токен
      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error("Нет refresh-токена");

            const res = await axios.post('http://62.169.27.192/api/refresh', { refreshToken });

            const newToken = res.data.token;
            localStorage.setItem('token', newToken);

            // Повторяем изначальный запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
         } catch (err) {
            console.error("Ошибка обновления токена", err);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = "/"; // Перенаправление на страницу логина
         }
      }

      return Promise.reject(error);
   }
);

export default api;
