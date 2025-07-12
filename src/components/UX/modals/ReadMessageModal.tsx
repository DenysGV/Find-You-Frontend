import { IModalRead } from "../../../types/IModal";
import IUser from "../../../types/IUser";
import { useEffect } from "react";
import axios from "axios";
import { convertUtcToLocal } from "../../../utils/DateUtils";

const ReadMessageModal = ({
   isOpen,
   setIsOpen,
   children,
   id,
   date_messages,
   time_messages,
   text_messages,
   sender,
   receiver,
   responseHandler,
   onMessageRead
}: IModalRead) => {
   const storedUser = localStorage.getItem('user');
   let user: IUser = storedUser ? JSON.parse(storedUser) : null;

   const openModal = () => {
      setIsOpen(true);
      // Помечаем сообщение как прочитанное при открытии модального окна
      if (receiver === user?.login) {
         markAsRead();
      }
   };

   // Помечаем сообщение как прочитанное также при первом рендере, если модальное окно открыто
   useEffect(() => {
      if (isOpen && receiver === user?.login) {
         markAsRead();
      }
   }, [isOpen]);

   const markAsRead = async () => {
      try {
         await axios.post('https://check-you.blog/api/mark-as-read', {
            message_id: id,
            user_id: user?.id
         });
         // Вызываем функцию обратного вызова для обновления счетчика непрочитанных сообщений
         if (onMessageRead) {
            onMessageRead(id);
         }
      } catch (error) {
         console.error('Ошибка при отметке сообщения как прочитанного:', error);
      }
   };

   const closeModal = () => setIsOpen(false);

   const handleResponse = () => {
      closeModal(); // Закрываем текущую модалку чтения
      responseHandler(sender); // Передаем отправителя в функцию ответа
   };

   const formattedDateTime = convertUtcToLocal(date_messages, time_messages);

   return (
      <>
         <div onClick={openModal} className='modal-block'>{children}</div>
         {isOpen && (
            <div id="loginModal" className="modal">
               <div className="modal-content">
                  <div className="modal-header">
                     <p>ПРОЧИТАТЬ СООБЩЕНИЕ</p>
                     <span className="close-btn" onClick={closeModal}>&times;</span>
                  </div>
                  <div className="modal-read__content">
                     <div className="modal-read-header">
                        <div className="modal-read-header__text">
                           <p className="modal-read-header__from">From: <span>{sender}</span></p>
                           <p className="modal-read-header__to">To: <span>{receiver}</span></p>
                        </div>
                        <div className="modal-read-header__date">
                           <p>Дата отправки:<br /><span>{formattedDateTime}</span></p>
                        </div>
                     </div>
                     <div className="modal-read__main">
                        <p>{text_messages}</p>
                     </div>
                     {user.login !== sender && <div className="modal-read__response" onClick={handleResponse}>
                        <p>ОТВЕТИТЬ</p>
                     </div>}
                  </div>
               </div>
            </div>
         )}
      </>
   );
}

export default ReadMessageModal;