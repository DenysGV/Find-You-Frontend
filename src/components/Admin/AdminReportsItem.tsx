import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IAdminReport, IAdminReportsItemState, IAdminReportsState } from "../../types/Admin"
import dayjs from "dayjs"
import SuccessModal from "../UX/modals/SuccessModal"
import ErrorModal from "../UX/modals/ErrorModal"

const AdminReportsItem = ({ reporter_user_login, reported_user_login, account_name, account_id, created_at, report_text, comment_id, id, setResult, comment_text }: IAdminReportsItemState) => {
   const apiUrlDelete = 'http://62.169.27.192/api/delete-reports'
   const apiUrlDeleteComment = 'http://62.169.27.192/api/delete-comment'
   const navigate = useNavigate()

   // Состояния для модальных окон вместо простых текстовых сообщений
   const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false)
   const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false)
   const [modalMessage, setModalMessage] = useState<string>('')

   const removeComment = async (comment_id: number) => {
      try {
         await axios.delete(apiUrlDeleteComment, {
            data: {
               comment_id: comment_id
            }
         })

         setResult((prev: IAdminReportsState) => ({
            ...prev,
            items: prev.items ? [...prev.items].filter(item => item.id != id) : prev.items
         }))

         // Показываем модальное окно с успешным сообщением
         setModalMessage('Комментарий успешно удален!')
         setSuccessModalOpen(true)
      } catch (error) {
         // Показываем модальное окно с ошибкой
         setModalMessage('Ошибка при удалении комментария, попробуйте ещё раз!')
         setErrorModalOpen(true)
      }
   }

   const deleteHandler = async (id: number) => {
      try {
         await axios.delete(apiUrlDelete, {
            data: {
               id,
            }
         })

         setResult((prev: IAdminReportsState) => ({
            ...prev,
            items: prev.items?.filter((item: IAdminReport) => item.id != id)
         }))

         // Показываем модальное окно с успешным сообщением
         setModalMessage('Жалоба успешно удалена')
         setSuccessModalOpen(true)
      } catch (error) {
         // Показываем модальное окно с ошибкой
         setModalMessage('Что-то пошло не так при удалении, попробуйте ещё раз!')
         setErrorModalOpen(true)
      }
   }

   return (
      <div className="admin-reports-item">
         {/* Модальные окна */}
         <SuccessModal isOpen={successModalOpen} setIsOpen={setSuccessModalOpen}>
            {modalMessage}
         </SuccessModal>
         <ErrorModal isOpen={errorModalOpen} setIsOpen={setErrorModalOpen}>
            {modalMessage}
         </ErrorModal>

         <div className="admin-reports-item__header">
            <div className="admin-reports-item__names">
               <p><span>From:</span> {reporter_user_login}</p>
               <p><span>To:</span> {reported_user_login}</p>
            </div>
            <p className="admin-reports-item__name" onClick={() => { navigate(`/${account_id}`) }}>{account_name} <svg width="25" height="25" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M45.3629 45.3629C47.2751 43.4507 48.792 41.1805 49.8269 38.6821C50.8618 36.1836 51.3945 33.5058 51.3945 30.8015C51.3945 28.0971 50.8618 25.4193 49.8269 22.9209C48.792 20.4224 47.2751 18.1522 45.3629 16.24C43.4507 14.3278 41.1805 12.8109 38.6821 11.776C36.1836 10.7411 33.5058 10.2084 30.8014 10.2084C28.0971 10.2084 25.4193 10.7411 22.9208 11.776C20.4224 12.8109 18.1522 14.3278 16.24 16.24C12.378 20.1019 10.2084 25.3398 10.2084 30.8015C10.2084 36.2631 12.378 41.501 16.24 45.3629C20.1019 49.2249 25.3398 51.3945 30.8014 51.3945C36.2631 51.3945 41.501 49.2249 45.3629 45.3629ZM45.3629 45.3629L58.3333 58.3333" stroke="#79C0AD" strokeWidth="4.375" strokeLinecap="round" strokeLinejoin="round" />
            </svg></p>
            <p>{dayjs(new Date(created_at)).format("DD.MM.YYYY: HH:mm")}</p>
            <p className="admin-reports-item__text">
               <span>{report_text}</span> {report_text == 'Оскорбление' ? <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 42.5C21.1643 40.9475 22.6741 39.6875 24.4098 38.8197C26.1455 37.9518 28.0594 37.5 30 37.5C34.09 37.5 37.72 39.465 40 42.5M17.5 22.525C17.5 22.525 21.025 22.2075 22.99 23.77M22.99 23.77L22.3325 25.8575C22.0725 26.68 22.75 27.5 23.69 27.5C24.68 27.5 25.3325 26.6075 24.8225 25.8375C24.3217 25.0581 23.7036 24.3607 22.99 23.77ZM42.5 22.5275C42.5 22.5275 38.975 22.2075 37.01 23.77M37.01 23.77L37.6675 25.8575C37.9275 26.68 37.25 27.5 36.31 27.5C35.32 27.5 34.6675 26.6075 35.1775 25.8375C35.6783 25.0581 36.2964 24.3607 37.01 23.77Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" />
               </svg> : <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29.98 40H30.0025M29.98 32.5V20M30.775 7.5H29.225C23.135 7.5 20.09 7.5 17.6 8.8825C15.1075 10.2625 13.63 12.77 10.6725 17.7875L9.1975 20.2875C6.4 25.035 5 27.4075 5 30C5 32.5925 6.4 34.965 9.2 39.7125L10.6725 42.2125C13.63 47.23 15.1075 49.7375 17.5975 51.12C20.09 52.5 23.135 52.5 29.2225 52.5H30.7775C36.865 52.5 39.91 52.5 42.4025 51.12C44.8925 49.7375 46.37 47.23 49.3275 42.2125L50.8025 39.7125C53.6 34.965 55 32.5925 55 30C55 27.4075 53.6 25.035 50.8 20.2875L49.3275 17.7875C46.37 12.77 44.8925 10.2625 42.4025 8.8825C39.91 7.5 36.865 7.5 30.775 7.5Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" />
               </svg>}
            </p>
            <div className="admin-reports-item__delete" onClick={() => { deleteHandler(id) }}>
               <p>Закрыть жалобу</p>
               <svg className="admin-order-item__bin" width="20" height="20" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
               </svg>
            </div>
         </div>
         <div className="admin-reports-item__footer">
            <div className="admin-reports-item__comment">
               <span>Текст комментария:</span>
               <p dangerouslySetInnerHTML={{ __html: comment_text }} />
            </div>
            <div>
               <svg onClick={() => { removeComment(comment_id) }} className="admin-order-item__bin" width="20" height="20" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
               </svg>
            </div>
         </div>
      </div>
   )
}

export default AdminReportsItem