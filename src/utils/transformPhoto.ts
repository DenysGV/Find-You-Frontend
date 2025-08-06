import IUser from "../types/IUser";

const transformPhoto = (photo: any): string => {
   // If photo is already a string URL, return it directly
   if (typeof photo === 'string') {
      return photo;
   }

   // If photo is an object with data property (Buffer data)
   if (photo && photo.data) {
      // Convert Buffer data to base64 string
      const base64String = btoa(
         photo.data.reduce((data: string, byte: number) => {
            return data + String.fromCharCode(byte);
         }, '')
      );
      return `data:image/jpeg;base64,${base64String}`;
   }

   // Return default image if photo is invalid
   return '/images/blog_image.jpg';
};

export const transformPhotoAvatar = (avatar: IUser['avatar']) => {
   // Если аватар не указан, возвращаем путь к плейсхолдеру
   if (!avatar) {
      return '/images/default-avatar.png';
   }

   // Если у нас есть только признак наличия аватара, но без данных
   if (avatar.data && avatar.data.length === 0) {
      // Получаем ID пользователя из localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
         try {
            const user = JSON.parse(storedUser);
            // Создаем URL для запроса аватара с сервера
            return `http://localhost:5000/user-avatar/${user.id}?${Date.now()}`; // Добавляем timestamp для предотвращения кэширования
         } catch (e) {
            console.error("Ошибка при получении ID пользователя:", e);
         }
      }
      return '/images/default-avatar.png';
   }

   // Старый код для обработки бинарных данных, если они присутствуют
   try {
      if (avatar.data && avatar.data.length > 0) {
         const uint8Array = new Uint8Array(avatar.data);
         const blob = new Blob([uint8Array], { type: 'image/jpeg' });
         return URL.createObjectURL(blob);
      }
   } catch (error) {
      console.error("Ошибка при трансформации фото:", error);
   }

   return '/images/default-avatar.png';
};

export default transformPhoto