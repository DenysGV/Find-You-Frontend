import { useState } from "react"
import axios from "axios"
import { ISection } from "../../../types/Admin"
import Title from "../../UX/Title"
import AdminSectionsItem from "../AdminSectionsItem"
import IUser from "../../../types/IUser"
import SuccessModal from "../../UX/modals/SuccessModal"
import ErrorModal from "../../UX/modals/ErrorModal"

const AdminSectionsContent = () => {
   const [sections, setSections] = useState<ISection[]>([])
   const [page, setPage] = useState<string>('')
   const [dropdownPage, setDropdownPage] = useState<boolean>(false);
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
   const [successMessage, setSuccessMessage] = useState<string>('');
   const [errorMessage, setErrorMessage] = useState<string>('');
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const setPageHandler = (page: string) => {
      setPage(page)
      setDropdownPage(false)
      setSections([{ id: Date.now() + Math.random(), layout: 0, text: '', files: [] }])
   }
   const addSectionHandler = () => {
      if (!page) return
      setSections((prev) => [...prev, { id: Date.now() + Math.random(), layout: 0, text: '', files: [] }]);
   }

   const savePageHandler = async () => {
      if (!page) {
         setErrorMessage("Выберите страницу!");
         setIsErrorModalOpen(true);
         return;
      }

      try {
         const formData = new FormData();
         formData.append("page_name", page);

         sections.forEach((section, index) => {
            formData.append(`sections[${index}][page_name]`, page);
            formData.append(`sections[${index}][section_order]`, String(index + 1)); // Преобразование в строку
            formData.append(`sections[${index}][layout_id]`, String(section.layout)); // Преобразование в строку
            formData.append(`sections[${index}][content]`, section.text);

            // Добавляем файлы, если они есть
            if (section.files && section.files.length > 0) {
               section.files.forEach((file) => {
                  formData.append('files', file); // Поменяйте на 'files' без индексации
               });
            }
         });

         await axios.post("https://check-you.blog/api/save-sections", formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         setSuccessMessage("Секции сохранены!");
         setIsSuccessModalOpen(true);
      } catch (error) {
         setErrorMessage("Ошибка при сохранении секций");
         setIsErrorModalOpen(true);
         console.error(error);
      }
   };

   if (user?.role != 'admin' && user?.role != 'moder') {
      return null;
   }

   return (
      <div className="admin-section">
         <Title classes='pt'>Конструктор</Title>
         <div className="admin-section__content">
            <div className={`admin-section-dropdown ${dropdownPage && 'active' || ''}`}>
               <button className="admin-section-dropdown__button btn" onClick={() => { setDropdownPage(prev => !prev) }}>
                  <span>{page ? page : 'Страница'}</span> <svg width="15" height="10" viewBox="0 0 28 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M1.5 1L14 13.5L26.5 1" stroke="grey" strokeWidth="2" />
                  </svg>
               </button>
               <div className="admin-section-dropdown__main">
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Про нас') }}>
                     Про нас
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Зеркала') }}>
                     Зеркала
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Бесплатный доступ') }}>
                     Бесплатный доступ
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Реферальная система') }}>
                     Реферальная система
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Обход блокировок') }}>
                     Обход блокировок
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Отказ от ответственности') }}>
                     Отказ от ответственности
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Футер') }}>
                     Футер
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Заказы') }}>
                     Заказы
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Удаление') }}>
                     Удаление
                  </button>
                  <button className="admin-section-dropdown__option btn" onClick={() => { setPageHandler('Cтранница 404') }}>
                     Cтранница 404
                  </button>
               </div>
            </div>
            {sections.map((item) => (
               <AdminSectionsItem key={item.id} id={item.id} setSections={setSections} />
            ))}
            <div className="admin-section-editor__more">
               <button className="btn" onClick={() => { addSectionHandler() }}>Добавить секцию</button>
            </div>
            <div className="admin-section-editor__more">
               <button className="btn btn-info" onClick={() => { savePageHandler() }}>Сохранить страницу</button>
            </div>
         </div>

         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>
      </div>
   )
}

export default AdminSectionsContent