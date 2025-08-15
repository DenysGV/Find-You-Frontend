import { Link } from "react-router-dom";
import { IHomeAccount } from "../../types/IAccounts";
import transformPhoto from "../../utils/transformPhoto";
import axios from "axios";
import { useEffect, useState } from "react";

const HomeContentItem = ({ id, photo }: IHomeAccount) => {
   const apiUrlGet = 'http://localhost:5000/account';
   const apiUrlAddView = 'http://localhost:5000/add-view';
   const [video, setVideo] = useState<string[]>([]);

   // Получаем данные текущего пользователя из localStorage для передачи user_id (если есть)
   const storedUser = localStorage.getItem('user');
   const user = storedUser ? JSON.parse(storedUser) : null;

   const clickHandler = async () => {
      try {
         // Добавляем просмотр с указанием ID пользователя, если он авторизован
         await axios.post(apiUrlAddView, {
            accounts_id: id,
            user_id: user?.id || null
         });
      } catch (error) {
         console.error("Ошибка при добавлении просмотра:", error);
      }
   };

   const getAccountHandler = async () => {
      try {
         const result = await axios.get(`${apiUrlGet}?id=${id}`);
         setVideo(result.data.files.filter((item: string) => item.includes('.mp4')));
      } catch (error) {
         console.error("Ошибка при получении данных аккаунта:", error);
      }
   };

   useEffect(() => {
      getAccountHandler();
   }, []);

   return (
      <div className="account-item" style={{ cursor: 'pointer' }} onClick={clickHandler}>
         <Link to={`/${id}`}>
            {typeof photo == 'string' ? <img src={`${photo}`} /> :
               photo && photo.data ? <img src={transformPhoto(photo)} /> :
                  <img src='/images/blog_image.jpg' />}
            {!!video.length && <div className="account-item__icon">
               VIDEO
            </div>}
         </Link>
      </div>
   );
};

export default HomeContentItem;