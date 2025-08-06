import { useState } from "react"
import Title from "../../UX/Title"
import { IAdminUser } from "../../../types/Admin"
import AdminUsersContentItems from "./AdminUsersContentItems"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import transformPhoto from "../../../utils/transformPhoto"
import AdminUsersToolbar from "../AdminUsersToolbar"
import IUser from "../../../types/IUser"
import SuccessModal from "../../UX/modals/SuccessModal"
import ErrorModal from "../../UX/modals/ErrorModal"

const AdminUsersContent = () => {
   const [login, setLogin] = useState<string>('')
   const [users, setUsers] = useState<IAdminUser[]>([])
   const [usersSelected, setUsersSelected] = useState<IAdminUser[]>([])
   const navigate = useNavigate()

   // Заменяем текстовые сообщения на модальные окна
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false)
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
   const [errorMessage, setErrorMessage] = useState<string>('')
   const [successMessage, setSuccessMessage] = useState<string>('')

   const apiUrlDelete = 'https://check-you.blog/api/users-delete'
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const submitSearchHandler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      navigate(`/admin-users?page=1&login=${login}`)
   }

   const deleteAccountsHandler = async () => {
      try {
         // Отправляем только массив ID вместо полных объектов
         const userIds = usersSelected.map(user => user.id);

         await axios.delete(apiUrlDelete, {
            data: {
               userIds: userIds, // Используем только ID вместо полных объектов
            }
         })

         // Показываем модальное окно с успешным сообщением
         setSuccessMessage('Аккаунты успешно удалены')
         setIsSuccessModalOpen(true)

         usersSelected.forEach(itemSelected => {
            setUsers(prev => prev && prev.filter(item => item.id != itemSelected.id))
         })
         setUsersSelected([])
      } catch (error) {
         console.error('Ошибка удаления:', error);

         // Показываем модальное окно с ошибкой
         setErrorMessage('Ошибка при удалении аккаунтов, попробуйте ещё раз!')
         setIsErrorModalOpen(true)
      }
   }

   if (user?.role != 'admin' && user?.role != 'moder') {
      return null;
   }

   return (
      <div className="admin-users">
         <Title>Пользователи</Title>

         {/* Подключаем модальные окна */}
         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>

         <form className="admin-accounts-get__form" onSubmit={submitSearchHandler}>
            <input type="text" placeholder="Логин пользователя" value={login} onChange={(e) => { setLogin(e.target.value) }} />
            <button type="submit" className="btn btn-info">Получить</button>
         </form>
         {usersSelected.length == 1 && <div className="admin-users__content">
            <div className="admin-users__content">
               <div className="admin-users-item">
                  <div className="admin-users-item__avatar">
                     {usersSelected[0].avatar ? <img src={transformPhoto(usersSelected[0].avatar)} /> : <svg width="35" height="35" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.29748 61.5869C7.29957 61.7363 7.33107 61.8838 7.39018 62.021C7.44928 62.1582 7.53484 62.2824 7.64196 62.3865C7.74908 62.4907 7.87566 62.5727 8.01448 62.6279C8.1533 62.6831 8.30164 62.7105 8.45102 62.7083H61.5446C61.6941 62.7106 61.8426 62.6835 61.9815 62.6283C62.1205 62.5732 62.2473 62.4912 62.3546 62.3871C62.4618 62.2829 62.5475 62.1586 62.6067 62.0213C62.6659 61.884 62.6975 61.7364 62.6996 61.5869V60.2481C62.7258 59.8442 62.7798 57.8317 61.4527 55.6048C60.6156 54.2004 59.4008 52.9885 57.8419 51.9998C55.9562 50.804 53.5573 49.9392 50.6552 49.4185C49.1819 49.2119 47.7206 48.9276 46.2773 48.5669C42.4389 47.5869 42.1035 46.7192 42.1006 46.7104C42.078 46.6249 42.0457 46.5422 42.0044 46.464C41.9723 46.3035 41.895 45.694 42.0437 44.0621C42.42 39.916 44.6439 37.466 46.4304 35.4973C46.9933 34.8775 47.5256 34.2898 47.9354 33.7152C49.7044 31.236 49.8677 28.4142 49.875 28.2392C49.8817 27.9291 49.8388 27.6199 49.7481 27.3233C49.5731 26.7837 49.2479 26.4483 49.0087 26.2004C48.9522 26.1436 48.8973 26.0852 48.8439 26.0254C48.8264 26.005 48.7798 25.9496 48.8221 25.671C48.9651 24.7737 49.0639 23.8699 49.1181 22.9629C49.1998 21.5017 49.2625 19.3171 48.8848 17.1894C48.8295 16.7829 48.7456 16.3809 48.6339 15.9862C48.2373 14.5211 47.5956 13.2718 46.7089 12.2383C46.5558 12.0706 42.84 8.155 32.0527 7.35291C30.5608 7.24208 29.0864 7.30187 27.6339 7.37625C27.2044 7.38589 26.7769 7.43866 26.3579 7.53375C25.2437 7.82104 24.9462 8.52687 24.8689 8.92208C24.7391 9.57833 24.9666 10.0858 25.1169 10.4242C25.1387 10.4723 25.1664 10.5321 25.1183 10.6896C24.8689 11.0775 24.4737 11.4275 24.0727 11.7585C23.956 11.8562 21.2523 14.1896 21.1035 17.236C20.7025 19.5533 20.7316 23.1627 21.2056 25.6579C21.2348 25.7965 21.2741 26.0006 21.2085 26.1392C20.6981 26.5956 20.1206 27.1133 20.1221 28.2946C20.1279 28.4142 20.2927 31.2346 22.0616 33.7152C22.47 34.2898 23.0023 34.876 23.5637 35.4958L23.5666 35.4973C25.3531 37.466 27.5771 39.916 27.9533 44.0606C28.1006 45.694 28.0233 46.3021 27.9927 46.464C27.9509 46.5421 27.9181 46.6248 27.895 46.7104C27.8935 46.7192 27.5596 47.584 23.7387 48.5625C21.5337 49.1269 19.3637 49.4156 19.2981 49.4229C16.4777 49.8998 14.0933 50.7442 12.2106 51.9327C10.6575 52.9142 9.43977 54.1304 8.59394 55.545C7.24061 57.8054 7.27706 59.8646 7.29602 60.2408L7.29748 61.5869Z" fill="#888888" stroke="#888888" stroke-width="5.83333" strokeLinejoin="round" />
                     </svg>}
                  </div>
                  <p className="admin-users-item__login">{usersSelected[0].login}</p>
                  <p className="admin-users-item__mail">{usersSelected[0].mail}</p>
                  <p className="admin-users-item__create">{usersSelected[0].date_of_create}</p>
                  <p className="admin-users-item__role">{usersSelected[0].role ? usersSelected[0].role : "Пользователь"}</p>
               </div>
            </div>
            <AdminUsersToolbar setSelected={setUsersSelected} setResult={setUsers} userId={usersSelected[0]?.id} />
         </div>}
         <div className="admin-accounts-get__toolbar">
            {usersSelected.length > 0 && <svg onClick={deleteAccountsHandler} width="35" height="35" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M15 47.5C15 48.8261 15.5268 50.0979 16.4645 51.0355C17.4021 51.9732 18.6739 52.5 20 52.5H40C41.3261 52.5 42.5979 51.9732 43.5355 51.0355C44.4732 50.0979 45 48.8261 45 47.5V17.5H15V47.5ZM20 22.5H40V47.5H20V22.5ZM38.75 10L36.25 7.5H23.75L21.25 10H12.5V15H47.5V10H38.75Z" fill="#E36F6F" />
            </svg>}
         </div>
         <AdminUsersContentItems users={users} setUsers={setUsers} setUsersSelected={setUsersSelected} />
      </div>
   )
}

export default AdminUsersContent