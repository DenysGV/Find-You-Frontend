import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { IMessageState } from "../../types/IMessage";
import IUser from "../../types/IUser";
import MessagesContentItem from "./MessagesContentItem";
import SendMessageModal from "../UX/modals/SendMessageModal";
import Pagination from "../UX/Pagination";
import SuccessModal from "../UX/modals/SuccessModal";
import ErrorModal from "../UX/modals/ErrorModal";

const MessagesContent = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const page = Number(searchParams.get("page")) || 1;
   const filter = searchParams.get("filter") || 'incoming';

   const [isOpenSend, setIsOpenSend] = useState<boolean>(false);
   const storedUser = localStorage.getItem('user');
   let user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const [result, setResult] = useState<IMessageState>({
      items: null,
      error: false,
      loading: false,
   });

   const [selected, setSelected] = useState<number[]>([]);
   const [responseLogin, setResponseLogin] = useState<string>('');
   const [unreadCount, setUnreadCount] = useState<number>(0);
   const [totalPages, setTotalPages] = useState<number>(1);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
   const [deleteType, setDeleteType] = useState<'local' | 'global'>('local');

   const [successMessage, setSuccessMessage] = useState<string>('');
   const [errorMessage, setErrorMessage] = useState<string>('');
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);

   const selectFilterHandler = (filterName: string): void => {
      setSelected([]);
      setSearchParams({ filter: filterName, page: "1" });
   };

   const deleteHandler = async () => {
      try {
         setErrorMessage('');
         setSuccessMessage('');
         setIsErrorModalOpen(false);
         setIsSuccessModalOpen(false);

         const apiUrlDelete = deleteType === 'local'
            ? `https://check-you.blog/api/delete-messages`
            : `https://check-you.blog/api/delete-messages-global`;

         await axios.delete(apiUrlDelete, {
            data: {
               user_id: user?.id,
               message_ids: selected,
            }
         });

         const successText = deleteType === 'local'
            ? 'Сообщения успешно скрыты'
            : 'Сообщения успешно удалены глобально';

         setSuccessMessage(successText);
         setIsSuccessModalOpen(true);

         setSelected([]);
         setShowDeleteConfirm(false);
         fetchMessages();

      } catch (error: any) {
         const errorText = error.response?.data?.error || 'Что-то пошло не так при удалении, попробуйте ещё раз!';
         setErrorMessage(errorText);
         setIsErrorModalOpen(true);
         console.error("Ошибка при удалении:", error);
         setShowDeleteConfirm(false);
      }
   };

   const openDeleteConfirmation = () => {
      setShowDeleteConfirm(true);
   };

   const fetchMessages = async () => {
      if (!user?.id) return;

      try {
         setResult(prev => ({ ...prev, loading: true, error: false }));
         const apiUrl = `https://check-you.blog/api/get-messages?user_id=${user.id}&page=${page}&filter=${filter}`;

         const response = await axios.get(apiUrl);

         setResult({
            items: response.data.messages,
            error: false,
            loading: false,
         });

         setTotalPages(response.data.totalPages || 1);
         setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
         console.error("Ошибка при загрузке сообщений:", error);
         setResult({
            items: null,
            error: true,
            loading: false,
         });
      }
   };

   const selectAllMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked && result.items) {
         const idsArr = result.items.map(item => item.id);
         setSelected(idsArr);
      } else {
         setSelected([]);
      }
   };

   const responseHandler = (login: string) => {
      setResponseLogin(login);
      setTimeout(() => {
         setIsOpenSend(true);
      }, 10);
   };

   const handleMessageRead = async (messageId: number) => {
      if (!user?.id) return;

      try {
         await axios.post('https://check-you.blog/api/mark-as-read', {
            message_id: messageId,
            user_id: user.id
         });

         setResult(prev => {
            if (prev.items) {
               const updatedItems = prev.items.map(item => {
                  if (item.id === messageId && !item.is_read) {
                     return { ...item, is_read: true };
                  }
                  return item;
               });
               return { ...prev, items: updatedItems };
            }
            return prev;
         });

         fetchUnreadCount();
      } catch (error) {
         console.error("Ошибка при отметке сообщения как прочитанное:", error);
         setErrorMessage('Не удалось отметить сообщение как прочитанное.');
         setIsErrorModalOpen(true);
      }
   };

   const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
         const response = await axios.get(`https://check-you.blog/api/unread-count?user_id=${user.id}`);
         setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
         console.error("Ошибка при получении количества непрочитанных:", error);
      }
   };

   useEffect(() => {
      if (user?.id) {
         fetchMessages();
         fetchUnreadCount();
      }
   }, [page, filter, user?.id]);

   return (
      <>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}

         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>
         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>


         <div className="messages__actions">
            <div className="messages__buttons">
               <div
                  className={`btn messages__button ${filter === 'incoming' ? 'active' : ''}`}
                  onClick={() => { selectFilterHandler('incoming') }}
               >
                  Входящие сообщения {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
               </div>
               <div
                  className={`btn messages__button ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => { selectFilterHandler('unread') }}
               >
                  Непрочитанные {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
               </div>
               <div
                  className={`btn messages__button ${filter === 'sent' ? 'active' : ''}`}
                  onClick={() => { selectFilterHandler('sent') }}
               >
                  Отправленные сообщения
               </div>
               <SendMessageModal
                  responseLogin={responseLogin}
                  setResponseLogin={setResponseLogin}
                  isOpen={isOpenSend}
                  setIsOpen={setIsOpenSend}
                  showSuccess={(msg) => { setSuccessMessage(msg); setIsSuccessModalOpen(true); }}
                  showError={(msg) => { setErrorMessage(msg); setIsErrorModalOpen(true); }}
               >
                  <div className="btn messages__button">Отправить сообщения</div>
               </SendMessageModal>
               {selected.length > 0 && (
                  <div className="delete-action">
                     <div
                        onClick={openDeleteConfirmation}
                        title="Удалить выбранные сообщения"
                        style={{ cursor: 'pointer' }}
                     >
                        <svg width="30" height="30" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
                        </svg>
                     </div>
                  </div>
               )}
            </div>
         </div>

         <hr />

         <div className="messages-table">
            <div className="messages-table-item messages-table__preview">
               <div className="messages-table-item__title"><p>Тема сообщения</p></div>
               <div className="messages-table-item__author"><p>Отправитель</p></div>
               <div className="messages-table-item__date"><p>Дата</p></div>
               <div className="messages-table-item__checkbox">
                  <input
                     type="checkbox"
                     onChange={selectAllMessages}
                     checked={
                        !!(
                           selected.length > 0 &&
                           result.items &&
                           result.items.length > 0 &&
                           selected.length === result.items.length
                        )
                     }
                     aria-label="Выбрать все сообщения"
                  />
               </div>
            </div>
            {result.error && !result.loading && <div className="no-messages"><p style={{ color: 'red' }}>Не удалось загрузить сообщения. Попробуйте ещё раз!</p></div>}

            {result.items && result.items.length > 0 ? (
               result.items.map(item => (
                  <MessagesContentItem
                     responseHandler={responseHandler}
                     onMessageRead={handleMessageRead}
                     onModalClose={() => { }}
                     {...item}
                     selected={selected}
                     setSelected={setSelected}
                     key={item.id}
                     is_read={item.is_read}
                  />
               ))
            ) : (
               !result.loading && !result.error && <div className="no-messages">
                  <p>Сообщений не найдено</p>
               </div>
            )}
         </div>

         <Pagination
            totalPages={totalPages}
            page={page}
            itemsLength={result.items ? result.items.length : 0}
            visiblePages={5}
            type="messages"
         />

         {showDeleteConfirm && (
            <div className="modal-overlay">
               <div className="modal-confirm">
                  <h3>Подтверждение удаления</h3>
                  <p>Вы уверены, что хотите удалить выбранные сообщения ({selected.length} шт.)?</p>
                  <p>Выберите тип удаления:</p>

                  <div className="delete-options">
                     <label>
                        <input
                           type="radio"
                           name="deleteType"
                           value="local"
                           checked={deleteType === 'local'}
                           onChange={() => setDeleteType('local')}
                        />
                        Скрыть для меня (сообщения останутся видимыми для других пользователей)
                     </label>

                     <label>
                        <input
                           type="radio"
                           name="deleteType"
                           value="global"
                           checked={deleteType === 'global'}
                           onChange={() => setDeleteType('global')}
                        />
                        Удалить глобально (сообщения будут удалены для всех пользователей)
                     </label>
                  </div>

                  <div className="modal-actions">
                     <button
                        className="btn btn-cancel"
                        onClick={() => setShowDeleteConfirm(false)}
                     >
                        Отмена
                     </button>
                     <button
                        className="btn btn-dangerous"
                        onClick={deleteHandler}
                     >
                        {deleteType === 'local' ? 'Скрыть' : 'Удалить глобально'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default MessagesContent;