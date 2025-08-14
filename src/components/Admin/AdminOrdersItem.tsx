import { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { IAdminOrdersItemProps } from "../../types/Admin";
import { IAdminOrderState } from "../../types/IOrder";
import IUser from "../../types/IUser";
import SuccessModal from "../UX/modals/SuccessModal";
import ErrorModal from "../UX/modals/ErrorModal";

const AdminOrdersItem = ({ id, login, text, type, created_at, status, setResult, openSendMessageModal }: IAdminOrdersItemProps) => {
   const apiUrl = 'http://62.169.27.192/api/update-orders'
   const apiUrlDelete = 'http://62.169.27.192/api/delete-orders'
   const statusArr: string[] = [
      'Отклонена',
      'Новое',
      'Принята'
   ]
   const [active, setActive] = useState<boolean>(false)
   const [selected, setSelecetd] = useState<number>(status)
   const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false)
   const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false)
   const [errorMessage, setErrorMessage] = useState<string>('')
   const [successMessage, setSuccessMessage] = useState<string>('')
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const setSelecetdHandler = async (num: number) => {
      try {
         await axios.put(apiUrl, {
            id: id,
            status: num
         })

         setSelecetd(num)
         setResult((prev: IAdminOrderState) => ({
            ...prev,
            items: prev.items
               ? {
                  ...prev.items,
                  data: prev.items.data.map(item =>
                     item.id === id ? { ...item, status: num } : item
                  )
               }
               : null
         }));

         setSuccessMessage('Смена статуса прошла успешно');
         setIsSuccessOpen(true);
      } catch (error) {
         setErrorMessage('Произошла ошибка при смене статуса');
         setIsErrorOpen(true);
      }
      setActive(false)
   }

   const deleteHandler = async () => {
      try {
         await axios.post(apiUrlDelete, {
            id: id,
            user_id: user?.id,
         })

         setResult((prev: IAdminOrderState) => ({
            ...prev,
            items: prev.items
               ? {
                  ...prev.items,
                  data: prev.items.data.filter(item => item.id !== id)
               }
               : null
         }));

         setSuccessMessage('Заказ успешно удален');
         setIsSuccessOpen(true);
      } catch (error) {
         setErrorMessage('Что-то пошло не так, попробуйте ещё раз!');
         setIsErrorOpen(true);
      }
   }

   const dropdownHandler = () => {
      setActive(prev => !prev)
   }

   const handleOpenSendMessage = () => {
      openSendMessageModal(login);
   }

   return (
      <div>
         <ErrorModal isOpen={isErrorOpen} setIsOpen={setIsErrorOpen}>
            {errorMessage}
         </ErrorModal>

         <SuccessModal isOpen={isSuccessOpen} setIsOpen={setIsSuccessOpen}>
            {successMessage}
         </SuccessModal>

         <div className="admin-order-item">
            <div className="order-item__text">
               <p className="order-item__response">от: {login} <svg onClick={handleOpenSendMessage} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20V16H5.17L4 17.17V4ZM4 2C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2H4ZM6 12H18V14H6V12ZM6 9H18V11H6V9ZM6 6H18V8H6V6Z" fill="#5B9A8B" />
               </svg> {type == 'delete' && '(Удаление)'} {type == 'add' && '(Заказ)'}</p>
               <p>{text}</p>
            </div>
            <p className="order-item__time">{dayjs(new Date(created_at)).format("DD.MM.YYYY HH:mm")}</p>
            <div className={`admin-order-dropdown ${active && 'active'}`}>
               <div>
                  <div onClick={dropdownHandler} className={`admin-order-dropdown__button order-item__status order-item__${selected}`}>{statusArr[selected]}</div>
               </div>
               <div className="admin-order-dropdown__main">
                  <div className="admin-order-dropdown__item order-item__status order-item__1" onClick={() => { setSelecetdHandler(1) }}>Новое</div>
                  <div className="admin-order-dropdown__item order-item__status order-item__2" onClick={() => { setSelecetdHandler(2) }}>Принято</div>
                  <div className="admin-order-dropdown__item order-item__status order-item__0" onClick={() => { setSelecetdHandler(0) }}>Отклонена</div>
               </div>
            </div>
            <svg onClick={deleteHandler} className="admin-order-item__bin" width="30" height="30" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
            </svg>
         </div>
      </div>
   )
}

export default AdminOrdersItem