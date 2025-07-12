import { useState, useEffect } from 'react';
import { IModalSend } from '../../../types/IModal';
import axios from 'axios';
import IUser from '../../../types/IUser';

interface ISendMessageModalProps extends IModalSend {
   showSuccess: (message: string) => void;
   showError: (message: string) => void;
}

const SendMessageModal = ({
   isOpen,
   setIsOpen,
   children,
   responseLogin,
   setResponseLogin,
   showSuccess,
   showError
}: ISendMessageModalProps) => {
   const [message, setMessage] = useState<string>("");
   const [login, setLogin] = useState<string>("");
   const storedUser = localStorage.getItem('user');
   let user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const [isAdminMessage, setIsAdminMessage] = useState<boolean>(false);

   useEffect(() => {
      if (isOpen && responseLogin === 'admin') {
         setIsAdminMessage(true);
      } else if (!isOpen) {
         setIsAdminMessage(false);
      }
   }, [isOpen, responseLogin]);

   useEffect(() => {
      if (responseLogin && isOpen) {
         setLogin(responseLogin);
      } else if (!isOpen) {
         if (!isAdminMessage) {
            setLogin('');
         }
      }
   }, [responseLogin, isOpen, isAdminMessage]);


   const openModal = () => setIsOpen(true);
   const closeModal = () => {
      setIsOpen(false);
      setMessage('');

      if (!isAdminMessage) {
         setLogin('');
         setResponseLogin && setResponseLogin('');
      }
   };

   const sendFormhandler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!login.trim()) {
         showError('Введите логин получателя');
         return;
      }
      if (!message.trim()) {
         showError('Введите текст сообщения');
         return;
      }
      if (!user?.id) {
         showError('Ошибка: Не удалось определить отправителя.');
         return;
      }

      try {
         await axios.post('https://check-you.blog/api/send-messages', {
            text_messages: message,
            user_from_id: user.id,
            user_to_login: login.trim()
         });

         showSuccess('Сообщение успешно отправлено');
         setMessage('');
         // closeModal(); // Раскомментируйте, если хотите закрывать окно после отправки

      } catch (err: any) {
         let errorText = 'Что-то пошло не так, попробуйте ещё раз!';
         if (err.response) {
            if (err.response.status === 404) {
               errorText = 'Получатель не найден!';
            } else if (err.response.data?.error) {
               errorText = err.response.data.error;
            }
         }
         showError(errorText);
         console.error("Ошибка при отправке сообщения:", err);
      }
   }

   return (
      <>
         <div onClick={openModal} className='modal-block'>{children}</div>
         {isOpen && (
            <div id="sendMessageModal" className="modal">
               <div className="modal-content">
                  <div className="modal-header">
                     ОТПРАВИТЬ СООБЩЕНИЕ
                     <span className="close-btn" onClick={closeModal}>&times;</span>
                  </div>
                  <form className='modal-send__form' onSubmit={sendFormhandler}>
                     <input
                        type="text"
                        name='to'
                        id='to'
                        value={login}
                        onChange={(e) => { setLogin(e.target.value) }}
                        placeholder='Логин получателя'
                        readOnly={isAdminMessage}
                        style={isAdminMessage ? { backgroundColor: '#eee' } : {}}
                     />
                     <textarea
                        placeholder="Сообщение..."
                        value={message}
                        onChange={(e) => { setMessage(e.target.value) }}
                        rows={5}
                     ></textarea>
                     <button type="submit" className='btn modal-send__button'>ОТПРАВИТЬ</button>
                  </form>
               </div>
            </div>
         )}
      </>
   );
};

export default SendMessageModal;