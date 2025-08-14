import { useNavigate } from "react-router-dom"
import IUser from "../../types/IUser"
import LoginModal from "../UX/modals/LoginModal"
import Sidebar from "../UX/sidebar/Sidebar"
import Title from "../UX/Title"
import UpButton from "../UX/UpButton"
import OrderContent from "./OrderContent"
import { useEffect, useState } from "react"
import distributeImagesByLayout from "../../utils/sectionSetting"
import Layout from "../UX/Layout"
import axios from "axios"
import { IAdminSections } from "../../types/Admin"

const OrderMain = () => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const navigate = useNavigate()
   const [isOpenLogin, setIsOpenLogin] = useState<boolean>(false);

   const apiUrl = `http://62.169.27.192/api/sections?page_name=Заказы`
   const [error, setError] = useState<boolean>(false)

   const [sections, setSections] = useState<IAdminSections | null>(null)

   const getSections = async () => {
      try {
         setError(false)

         const response = await axios.get(apiUrl)

         setSections(response.data)
      } catch (error) {
         setError(true)
      }
   }

   useEffect(() => {
      getSections()
   }, [])


   const navigateHandler = (to: string) => {
      navigate(`/${to}`)
   }

   return (
      <div className="layout-container">
         <div>
            <UpButton />
            <div className="layout-row">
               <div className="col-10">
                  <div id="dle-content">
                     {user ? <>
                        <Title classes='pt'>Подать Заявку</Title>
                        {error && <p>Произошла ошибка при загрузке страницы, попробуйте ещё раз!</p>}
                        {sections && distributeImagesByLayout(sections?.images, sections?.sections).map((section) => (
                           <Layout key={section.id} layoutId={section.layout_id} text={section.content} urls={section.images} publicComponent={true} />
                        ))}
                        <OrderContent />
                     </> : <div className="account-warning">
                        <div className="account-warning__text fav__warning">
                           <h5>Доступ ограничен</h5>
                           <p>Для просмотра вам необходимо пройти процедуру регистрации или если вы это уже сделали авторизуйтесь на сайте</p>
                        </div>
                        <div className="account-warning__buttons">
                           <button className="btn-info" onClick={() => { navigateHandler('registration') }}>Регистрация</button>
                           <LoginModal isOpen={isOpenLogin} setIsOpen={setIsOpenLogin}><button className="btn btn-info">Вход</button></LoginModal>
                           <button className="btn-info" onClick={() => { navigateHandler('recovery') }}>Забыли пароль?</button>
                        </div>
                     </div>}
                  </div>
               </div>
               <Sidebar />
            </div>
         </div>
      </div>
   )
}

export default OrderMain