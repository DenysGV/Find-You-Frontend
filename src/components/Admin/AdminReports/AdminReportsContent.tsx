import { useEffect, useState } from "react"
import { IAdminReportsState } from "../../../types/Admin"
import fetchData from "../../../services/fetchData"
import Title from "../../UX/Title"
import AdminReportsItem from "../AdminReportsItem"
import IUser from "../../../types/IUser"
import SuccessModal from "../../UX/modals/SuccessModal"
import ErrorModal from "../../UX/modals/ErrorModal"

const AdminReportsContent = () => {
   const apiUrl = `https://check-you.blog/api/reports`
   const [filter, setFilter] = useState<string>('new')
   const [result, setResult] = useState<IAdminReportsState>({
      items: null,
      loading: false,
      error: false,
   })

   // Состояния для модальных окон
   const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false)
   const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false)
   const [modalMessage, setModalMessage] = useState<string>('')

   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const getReports = async (url: string) => {
      try {
         await fetchData('get', url, setResult)

         // Показываем модальное окно, если нет жалоб
         if (result.items && result.items.length === 0) {
            setModalMessage('Жалоб нет')
            setSuccessModalOpen(true)
         }
      } catch (error) {
         // Показываем модальное окно с ошибкой
         setModalMessage('Не удалось загрузить жалобы, попробуйте ещё раз')
         setErrorModalOpen(true)
      }
   }

   useEffect(() => {
      getReports(apiUrl)
   }, [])

   // Обработчики для фильтров с модальными окнами для подтверждения
   const handleFilterChange = (newFilter: string) => {
      setFilter(newFilter)
   }

   if (user?.role != 'admin' && user?.role != 'moder') {
      return null
   }

   return (
      <div className="admin-reports">
         {/* Модальные окна */}
         <SuccessModal isOpen={successModalOpen} setIsOpen={setSuccessModalOpen}>
            {modalMessage}
         </SuccessModal>
         <ErrorModal isOpen={errorModalOpen} setIsOpen={setErrorModalOpen}>
            {modalMessage}
         </ErrorModal>

         <Title classes='pt'>Жалобы</Title>

         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}

         <div className="admin-reports__buttons">
            <div className={`btn ${filter === 'new' ? 'active' : ''}`} onClick={() => { handleFilterChange('new') }}>Сначала новые</div>
            <div className={`btn ${filter === 'old' ? 'active' : ''}`} onClick={() => { handleFilterChange('old') }}>Сначала старые</div>
         </div>

         <div className="admin-reports__items">
            {result.items && result.items.length > 0 ?
               result.items.sort((a, b) => {
                  if (filter == 'new') {
                     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  } else if (filter == 'old') {
                     return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  }
                  return 0
               }).map(item => (
                  <AdminReportsItem {...item} setResult={setResult} key={item.id} />
               ))
               :
               !result.loading && (
                  <div className="no-reports">
                     <p>Нет доступных жалоб для отображения</p>
                  </div>
               )
            }
         </div>
      </div>
   )
}

export default AdminReportsContent