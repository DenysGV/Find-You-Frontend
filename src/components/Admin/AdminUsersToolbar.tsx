import { useState, useEffect } from "react"
import axios from "axios"
import { IAdminUser, IAdminUserToolbar } from "../../types/Admin"
import IUser from "../../types/IUser"
import { refreshUserData } from "../../utils/userSessionChecker"
import SuccessModal from "../UX/modals/SuccessModal"
import ErrorModal from "../UX/modals/ErrorModal"


const AdminUsersToolbar = ({ setResult, setSelected, userId }: IAdminUserToolbar) => {
   const apiUrlAddRole = `http://62.169.27.192/api/add-role`
   const [role, setRole] = useState<string>('user')

   // Заменяем текстовые сообщения на модальные окна
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false)
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
   const [errorMessage, setErrorMessage] = useState<string>('')
   const [successMessage, setSuccessMessage] = useState<string>('')

   const [canEditRole, setCanEditRole] = useState<boolean>(true)

   const storedUser = localStorage.getItem('user');
   const currentUser: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   // Получаем текущего выбранного пользователя
   useEffect(() => {
      if (userId) {
         // Получаем информацию о выбранном пользователе через API
         const fetchUserInfo = async () => {
            try {
               const response = await axios.get(`http://62.169.27.192/api/get-role?user_id=${userId}`);
               const selectedUser = response.data;

               // Если текущий пользователь - модератор и выбранный пользователь модератор или админ
               if (currentUser?.role === 'moder' &&
                  selectedUser &&
                  (selectedUser.name === 'moder' || selectedUser.name === 'admin')) {
                  setCanEditRole(false);
                  // Показываем модальное окно с ошибкой
                  setErrorMessage('Модераторам запрещено изменять права других модераторов и админов');
                  setIsErrorModalOpen(true);
               } else {
                  setCanEditRole(true);
               }
            } catch (err) {
               console.error("Ошибка при получении информации о пользователе:", err);
            }
         };

         fetchUserInfo();
      }
   }, [userId]);

   const editRole = async () => {
      try {
         // Получаем актуальную информацию о пользователе перед изменением роли
         const userResponse = await axios.get(`http://62.169.27.192/api/get-role?user_id=${userId}`);
         const selectedUser = userResponse.data;

         // Дополнительная проверка прав перед отправкой запроса
         if (currentUser?.role === 'moder' &&
            (selectedUser.name === 'moder' || selectedUser.name === 'admin')) {
            // Показываем модальное окно с ошибкой
            setErrorMessage('Модераторам запрещено изменять права других модераторов и админов');
            setIsErrorModalOpen(true);
            return;
         }

         // 1. Меняем роль пользователя
         const res = await axios.post(apiUrlAddRole, {
            user_id: userId,
            role_name: role,
         })

         // 3. Обновляем UI
         setResult((prev: IAdminUser[]) => prev.map(item => {
            if (item.id == userId) {
               return { ...item, role: res.data.data ? res.data.data.name : 'Пользователь' };
            }
            return item;
         }));

         // Обновить выбранного пользователя
         const updatedRole = res.data.data ? res.data.data.name : 'Пользователь';
         setSelected((prev: IAdminUser[]) => {
            return prev.map(user => {
               if (user.id === userId) {
                  return { ...user, role: updatedRole };
               }
               return user;
            });
         });

         // Проверяем, не меняет ли админ свою собственную роль
         if (currentUser && currentUser.id === userId) {
            // Обновляем данные текущего пользователя без перезахода
            refreshUserData();
         }

         // Показываем модальное окно с успехом
         setSuccessMessage('Роль успешно задана.');
         setIsSuccessModalOpen(true);
      } catch (error) {
         // Показываем модальное окно с ошибкой
         setErrorMessage('Что-то пошло не так при смене роли, попробуйте ещё раз!');
         setIsErrorModalOpen(true);
      }
   }

   return (
      <>
         {/* Подключаем модальные окна */}
         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>

         <div className="admin-users-toolbar">
            <div className="admin-users-toolbar__form">
               <select
                  className="btn"
                  onChange={(e) => { setRole(e.currentTarget.value) }}
                  disabled={!canEditRole}
               >
                  <option value="user">Пользователь</option>
                  <option value="subscriber">Подписка</option>
                  {currentUser?.role === 'admin' && <>
                     <option value="moder">Модератор</option>
                     <option value="admin">Админ</option>
                  </>}
               </select>
               <button
                  className="btn btn-info"
                  onClick={editRole}
                  disabled={!canEditRole}
               >
                  Установить роль
               </button>
            </div>
         </div>
      </>
   )
}

export default AdminUsersToolbar