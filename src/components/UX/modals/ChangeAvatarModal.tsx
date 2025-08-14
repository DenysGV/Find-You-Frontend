import { useState, useEffect } from "react";
import IModal from "../../../types/IModal";
import axios from "axios";
import IUser from "../../../types/IUser";
import { transformPhotoAvatar } from "../../../utils/transformPhoto";

const ChangeAvatarModal = ({ isOpen, setIsOpen, children }: IModal) => {
   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);
   const [user, setUser] = useState<IUser | null>(null);
   const [error, setError] = useState<string>('');
   const [success, setSuccess] = useState<boolean>(false);
   const apiUrlUpdate = 'http://62.169.27.192/api/change-user-avatar';
   const [accountPhoto, setAccountPhoto] = useState<File | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(false);

   // Загружаем данные пользователя при открытии модального окна
   useEffect(() => {
      if (isOpen) {
         const storedUser = localStorage.getItem('user');
         if (storedUser) {
            try {
               setUser(JSON.parse(storedUser));
            } catch (e) {
               console.error("Ошибка при парсинге данных пользователя:", e);
               setError("Ошибка доступа к данным пользователя");
            }
         }
         // Сбрасываем состояния при открытии модального окна
         setAccountPhoto(null);
         setError('');
         setSuccess(false);
      }
   }, [isOpen]);

   const saveHandlerPhoto = async () => {
      try {
         setError('');
         setSuccess(false);

         if (!accountPhoto) {
            setError('Выберите фотку аккаунта');
            return;
         }

         if (!user) {
            setError('Пользователь не авторизован');
            return;
         }

         setIsLoading(true);

         const formData = new FormData();
         formData.append("photo", accountPhoto);
         formData.append("id", String(user.id));

         const res = await axios.post(apiUrlUpdate, formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         if (res.data && res.data.id) {
            // Сохраняем все оригинальные данные пользователя,
            // перезаписывая только обновленные поля из ответа
            const updatedUser = {
               ...user,
               ...res.data,
               // Если в ответе есть особые поля, которые сервер не возвращает, 
               // но они должны быть сохранены из текущих данных пользователя
               role: user.role  // Сохраняем роль, если она есть в текущих данных
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setSuccess(true);

            // Обновить данные на главной странице через событие
            window.dispatchEvent(new Event('userUpdated'));

            // Закрываем модальное окно через небольшую задержку, чтобы пользователь увидел успешное сообщение
            setTimeout(() => {
               closeModal();
            }, 1500);
         } else {
            throw new Error('Некорректный ответ от сервера');
         }
      } catch (error: any) {
         console.error("Ошибка при обновлении фото:", error);
         const errorMessage = error.response?.data?.message
            ? `Ошибка: ${error.response.data.message}`
            : 'Ошибка при обновлении фото, попробуйте ещё раз!';
         setError(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <div onClick={openModal}>{children}</div>
         {isOpen && (
            <div id="loginModal" className="modal">
               <div className="modal-content">
                  <div className="modal-header">
                     РЕДАКТИРОВАНИЕ АВАТАРА
                     <span className="close-btn" onClick={closeModal}>&times;</span>
                  </div>
                  <div className="avatar-modal">
                     {error && <p style={{ color: 'red' }}>{error}</p>}
                     {success && <p style={{ color: 'green' }}>Аватар успешно обновлен!</p>}
                     <div className="avatar-preview">
                        {accountPhoto ?
                           <img src={URL.createObjectURL(accountPhoto)} alt="Новый аватар" /> :
                           user?.avatar ?
                              <img src={transformPhotoAvatar(user.avatar)} alt="Текущий аватар" /> :
                              <svg width="100" height="100" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M7.29748 61.5869C7.29957 61.7363 7.33107 61.8838 7.39018 62.021C7.44928 62.1582 7.53484 62.2824 7.64196 62.3865C7.74908 62.4907 7.87566 62.5727 8.01448 62.6279C8.1533 62.6831 8.30164 62.7105 8.45102 62.7083H61.5446C61.6941 62.7106 61.8426 62.6835 61.9815 62.6283C62.1205 62.5732 62.2473 62.4912 62.3546 62.3871C62.4618 62.2829 62.5475 62.1586 62.6067 62.0213C62.6659 61.884 62.6975 61.7364 62.6996 61.5869V60.2481C62.7258 59.8442 62.7798 57.8317 61.4527 55.6048C60.6156 54.2004 59.4008 52.9885 57.8419 51.9998C55.9562 50.804 53.5573 49.9392 50.6552 49.4185C49.1819 49.2119 47.7206 48.9276 46.2773 48.5669C42.4389 47.5869 42.1035 46.7192 42.1006 46.7104C42.078 46.6249 42.0457 46.5422 42.0044 46.464C41.9723 46.3035 41.895 45.694 42.0437 44.0621C42.42 39.916 44.6439 37.466 46.4304 35.4973C46.9933 34.8775 47.5256 34.2898 47.9354 33.7152C49.7044 31.236 49.8677 28.4142 49.875 28.2392C49.8817 27.9291 49.8388 27.6199 49.7481 27.3233C49.5731 26.7837 49.2479 26.4483 49.0087 26.2004C48.9522 26.1436 48.8973 26.0852 48.8439 26.0254C48.8264 26.005 48.7798 25.9496 48.8221 25.671C48.9651 24.7737 49.0639 23.8699 49.1181 22.9629C49.1998 21.5017 49.2625 19.3171 48.8848 17.1894C48.8295 16.7829 48.7456 16.3809 48.6339 15.9862C48.2373 14.5211 47.5956 13.2718 46.7089 12.2383C46.5558 12.0706 42.84 8.155 32.0527 7.35291C30.5608 7.24208 29.0864 7.30187 27.6339 7.37625C27.2044 7.38589 26.7769 7.43866 26.3579 7.53375C25.2437 7.82104 24.9462 8.52687 24.8689 8.92208C24.7391 9.57833 24.9666 10.0858 25.1169 10.4242C25.1387 10.4723 25.1664 10.5321 25.1183 10.6896C24.8689 11.0775 24.4737 11.4275 24.0727 11.7585C23.956 11.8562 21.2523 14.1896 21.1035 17.236C20.7025 19.5533 20.7316 23.1627 21.2056 25.6579C21.2348 25.7965 21.2741 26.0006 21.2085 26.1392C20.6981 26.5956 20.1206 27.1133 20.1221 28.2946C20.1279 28.4142 20.2927 31.2346 22.0616 33.7152C22.47 34.2898 23.0023 34.876 23.5637 35.4958L23.5666 35.4973C25.3531 37.466 27.5771 39.916 27.9533 44.0606C28.1006 45.694 28.0233 46.3021 27.9927 46.464C27.9509 46.5421 27.9181 46.6248 27.895 46.7104C27.8935 46.7192 27.5596 47.584 23.7387 48.5625C21.5337 49.1269 19.3637 49.4156 19.2981 49.4229C16.4777 49.8998 14.0933 50.7442 12.2106 51.9327C10.6575 52.9142 9.43977 54.1304 8.59394 55.545C7.24061 57.8054 7.27706 59.8646 7.29602 60.2408L7.29748 61.5869Z" fill="#888888" stroke="#888888" strokeWidth="5.83333" strokeLinejoin="round" />
                              </svg>
                        }
                     </div>
                     <div className="admin-accounts-get__files">
                        <input
                           type="file"
                           accept="image/*"
                           onChange={(e) => setAccountPhoto(e.target.files ? e.target.files[0] : null)}
                           disabled={isLoading}
                        />
                        <button
                           className="btn btn-info"
                           onClick={saveHandlerPhoto}
                           disabled={isLoading || !accountPhoto}
                        >
                           {isLoading ? 'Загрузка...' : 'Сохранить'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default ChangeAvatarModal;