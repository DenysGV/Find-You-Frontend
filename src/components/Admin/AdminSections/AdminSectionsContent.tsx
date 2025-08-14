import { useState, useEffect } from "react";
import axios from "axios";
// Убедитесь, что путь правильный для ваших типов
import { ISection } from "../../../types/Admin";
import Title from "../../UX/Title";
import AdminSectionsItem from "../AdminSectionsItem";
import SuccessModal from "../../UX/modals/SuccessModal";
import ErrorModal from "../../UX/modals/ErrorModal";
// Импортируем функцию для распределения изображений
import distributeImagesByLayout from "../../../utils/sectionSetting"; // Убедитесь, что путь правильный
import IUser from "../../../types/IUser";

export interface IBackendSection {
   id: number;
   layout_id: number;
   content: string;
   section_order: number;
   page_name: string;
}

const AdminSectionsContent = () => {
   // --- СОСТОЯНИЕ КОМПОНЕНТА ---
   const [sections, setSections] = useState<ISection[]>([]);
   const [page, setPage] = useState<string>('');
   const [dropdownPage, setDropdownPage] = useState<boolean>(false);
   const [isLoading, setIsLoading] = useState<boolean>(false);

   // Состояния для модальных окон
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
   const [successMessage, setSuccessMessage] = useState<string>('');
   const [errorMessage, setErrorMessage] = useState<string>('');

   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   useEffect(() => {
      if (!page) {
         setSections([]);
         return;
      }

      fetchPageContent();
   }, [page]); // Зависимость от `page`

   const fetchPageContent = async () => {
      setIsLoading(true);
      try {
         const response = await axios.get(`http://62.169.27.192/api/sections?page_name=${page}`);
         const { sections: dbSections, images: pageImages } = response.data;

         const sectionsWithAssignedImages = distributeImagesByLayout(pageImages, dbSections);

         // Преобразуем данные с сервера в формат, понятный фронтенду
         const loadedSections: ISection[] = sectionsWithAssignedImages.map((section: any) => ({
            id: section.id, // Используем ID из базы данных
            layout: section.layout_id, // Используем layout_id из базы данных
            text: section.content,
            mediaItems: section.images || [] // Изображения, назначенные distributeImagesByLayout, теперь в mediaItems
         }));

         setSections(loadedSections);

      } catch (error: any) {
         if (error.response && error.response.status === 404) {
            // Инициализируем новую секцию с пустым массивом mediaItems
            setSections([{ id: Date.now(), layout: 0, text: '', mediaItems: [] }]);
         } else {
            setErrorMessage("Ошибка при загрузке данных страницы.");
            setIsErrorModalOpen(true);
            console.error("Ошибка при загрузке секций:", error);
         }
      } finally {
         setIsLoading(false);
      }
   };

   // --- ОБРАБОТЧИКИ ---

   const setPageHandler = (selectedPage: string) => {
      setPage(selectedPage);
      setDropdownPage(false);
   };

   const addSectionHandler = () => {
      if (!page) return;
      // Добавляем новую пустую секцию в конец списка с пустым массивом mediaItems
      setSections((prev) => [...prev, { id: Date.now() + Math.random(), layout: 0, text: '', mediaItems: [] }]);
   };

   const savePageHandler = async () => {
      if (!page) {
         setErrorMessage("Выберите страницу!");
         setIsErrorModalOpen(true);
         return;
      }
      if (sections.length === 0) {
         setErrorMessage("Добавьте хотя бы одну секцию!");
         setIsErrorModalOpen(true);
         return;
      }

      try {
         const formData = new FormData();
         formData.append("page_name", page);

         // Собираем данные секций для отправки (без image_urls, так как их нет в БД)
         const sectionsData = sections.map((section, index) => ({
            id: section.id, // Отправляем ID секции, если она уже существует
            page_name: page,
            section_order: index + 1,
            layout_id: section.layout,
            content: section.text,
         }));

         // Собираем все URL-адреса изображений, которые должны остаться на сервере
         // Это включает как существующие URL-адреса, так и имена новых файлов
         const allRetainedMediaItems: string[] = [];
         sections.forEach(section => {
            section.mediaItems.forEach(item => {
               if (typeof item === 'string') { // Если это существующий URL
                  allRetainedMediaItems.push(item);
               } else if (item instanceof File) { // Если это новый File объект
                  allRetainedMediaItems.push(item.name); // Отправляем имя файла
               }
            });
         });

         // Добавляем данные секций как JSON строку
         formData.append('sections', JSON.stringify(sectionsData));
         // Добавляем список URL-адресов/имен файлов, которые должны быть сохранены на сервере
         formData.append('retained_media_items', JSON.stringify(allRetainedMediaItems));


         // Добавляем все File объекты (новые или замененные файлы)
         sections.forEach(section => {
            section.mediaItems.forEach(item => {
               if (item instanceof File) {
                  formData.append('files', item); // Multer обработает эти файлы
               }
            });
         });

         await axios.post("http://62.169.27.192/api/save-sections", formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         setSuccessMessage("Страница успешно сохранена!");
         setIsSuccessModalOpen(true);

         // После сохранения, повторно загружаем данные, чтобы обновить состояние
         // и убедиться, что все изображения правильно подтянулись с сервера.
         fetchPageContent();

      } catch (error) {
         setErrorMessage("Ошибка при сохранении страницы");
         setIsErrorModalOpen(true);
         console.error(error);
      }
   };

   // Проверка прав доступа
   if (user?.role !== 'admin' && user?.role !== 'moder') {
      return null;
   }

   // --- РЕНДЕР КОМПОНЕНТА ---
   return (
      <div className="admin-section">
         <Title classes='pt'>Конструктор страниц</Title>
         <div className="admin-section__content">
            <div className={`admin-section-dropdown ${dropdownPage && 'active' || ''}`}>
               <button className="admin-section-dropdown__button btn" onClick={() => setDropdownPage(prev => !prev)}>
                  <span>{page ? page : 'Выберите страницу'}</span>
                  <svg width="15" height="10" viewBox="0 0 28 15" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            {isLoading && <p>Загрузка...</p>}

            {!isLoading && sections.map((item) => (
               <AdminSectionsItem key={item.id} section={item} setSections={setSections} />
            ))}

            {!isLoading && page && (
               <>
                  <div className="admin-section-editor__more">
                     <button className="btn" onClick={addSectionHandler}>Добавить секцию</button>
                  </div>
                  <div className="admin-section-editor__more">
                     <button className="btn btn-info" onClick={savePageHandler}>Сохранить страницу</button>
                  </div>
               </>
            )}
         </div>

         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>
      </div>
   );
};

export default AdminSectionsContent;