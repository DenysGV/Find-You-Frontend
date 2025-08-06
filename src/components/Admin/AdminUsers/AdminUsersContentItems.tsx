import axios from "axios";
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { IAdminUsersState } from "../../../types/Admin";
import Pagination from "../../UX/Pagination";
import AdminUsersContentItem from "./AdminUsersContentItem";
import ErrorModal from "../../UX/modals/ErrorModal";

const AdminUsersContentItems = ({ users, setUsers, setUsersSelected }: IAdminUsersState) => {
   // Заменяем текстовое сообщение ошибки на модальное окно
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>('');

   const [totalPages, setTotalPages] = useState<number>(1);
   const [searchParams] = useSearchParams();
   const page = Number(searchParams.get("page")) || 1;
   const search = searchParams.get("login") || '';

   const getUsersHandler = async () => {
      let apiUrlAccouts = `http://localhost:5000/users?page=${page}`;
      if (search) {
         apiUrlAccouts += `&login=${search}`
      }
      try {
         const result = await axios.get(`${apiUrlAccouts}`)
         setTotalPages(result.data.totalPages || 1);
         setUsers(result.data.users)
      } catch (error) {
         // Показываем модальное окно с ошибкой вместо текстового сообщения
         setErrorMessage('Ошибка при получении аккаунта, попробуйте ещё раз!');
         setIsErrorModalOpen(true);
      }
   }

   useEffect(() => {
      getUsersHandler()
   }, [page, search])

   return (
      <div>
         {/* Подключаем модальное окно с ошибкой */}
         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>

         {users && users.map(item => (
            <AdminUsersContentItem key={item.id} user={{ ...item }} setUsersSelected={setUsersSelected} />
         ))}
         <Pagination totalPages={totalPages} page={page} itemsLength={users ? users.length : 0} cityId={0} tagIds={[]} search={search} visiblePages={5} type={'users'} />
      </div>
   )
}

export default AdminUsersContentItems