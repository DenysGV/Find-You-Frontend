import { useEffect, useState } from "react"
import fetchData from "../../../services/fetchData"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale"
import IUser from "../../../types/IUser"
import { IAdminOrderState } from "../../../types/IOrder"
import Title from "../../UX/Title"
import AdminOrdersItem from "../AdminOrdersItem"
import Pagination from "../../UX/Pagination"
import { useSearchParams } from "react-router-dom"
import SendMessageModal from "../../UX/modals/SendMessageModal"
import { format, startOfDay } from 'date-fns'
import ErrorModal from "../../UX/modals/ErrorModal";
import SuccessModal from "../../UX/modals/SuccessModal";

const AdminOrdersContent = () => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   let apiUrl: string = `https://check-you.blog/api/get-admin-orders?user_id=${user?.id}`
   const [result, setResult] = useState<IAdminOrderState>({
      items: null,
      loading: false,
      error: false,
   })
   const [filter, setFilter] = useState<string>('')
   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
   const [startDate, endDate] = dateRange;
   const [searchParams] = useSearchParams();
   const page = Number(searchParams.get("page")) || 1;
   const [isOpenSend, setIsOpenSend] = useState<boolean>(false);
   const [responseLogin, setResponseLogin] = useState<string>('');

   // Состояния для модальных окон
   const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>('');
   const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
   const [successMessage, setSuccessMessage] = useState<string>('');

   // Состояние для хранения всех дат заказов для подсветки
   const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
   // Состояние для отслеживания загрузки всех дат
   const [allDatesLoading, setAllDatesLoading] = useState<boolean>(false);

   // Функции для обработки успешной отправки и ошибок в модальном окне SendMessage
   const handleShowSuccess = (message: string) => {
      setSuccessMessage(message);
      setIsSuccessOpen(true);
   };

   const handleShowError = (message: string) => {
      setErrorMessage(message);
      setIsErrorOpen(true);
   };

   const openSendMessageModal = (login: string) => {
      setResponseLogin(login);
      // Небольшая задержка для правильной последовательности установки state
      setTimeout(() => {
         setIsOpenSend(true);
      }, 10);
   };

   const setFilterHandler = (str: string) => {
      setFilter(str)
   }

   // Функция для получения заказов с фильтрами и пагинацией
   const getOrders = async (url?: string) => {
      let finalUrl = apiUrl;

      // Добавляем параметр страницы, если его еще нет
      if (!finalUrl.includes('page')) {
         finalUrl += `&page=${page}`
      }

      // Добавляем параметры дат, если они есть
      if (url) {
         finalUrl += url;
      }

      await fetchData('get', finalUrl, setResult)
   }

   // Функция для получения всех дат заказов для подсветки
   const getAllOrderDates = async () => {
      setAllDatesLoading(true);

      try {
         const response = await fetch(`https://check-you.blog/api/get-all-order-dates?user_id=${user?.id}`);

         if (!response.ok) {
            throw new Error('Ошибка при получении дат заказов');
         }

         const data = await response.json();

         if (data.dates && Array.isArray(data.dates)) {
            // Преобразуем строки дат в объекты Date для подсветки
            const dates = data.dates.map((dateStr: any) => startOfDay(new Date(dateStr)));
            setHighlightedDates(dates);
         }
      } catch (error) {
         console.error('Ошибка при получении дат заказов:', error);
         handleShowError('Ошибка при получении дат заказов');
      } finally {
         setAllDatesLoading(false);
      }
   };

   // Функция для обработки изменения диапазона дат
   const handleDateRangeChange = (update: [Date | null, Date | null]) => {
      setDateRange(update);
   };

   // При первой загрузке компонента загружаем все даты для подсветки
   useEffect(() => {
      getAllOrderDates();
   }, []);

   // Загружаем заказы при изменении страницы
   useEffect(() => {
      // Если есть выбранные даты, обновляем запрос с датами
      if (startDate && endDate) {
         const formatDateForUrl = (date: Date | null): string => {
            if (!date) return '';
            return format(startOfDay(date), 'yyyy-MM-dd');
         };

         getOrders(`&start_date=${formatDateForUrl(startDate)}&end_date=${formatDateForUrl(endDate)}`);
      } else {
         getOrders();
      }
   }, [page]);

   // Обработка изменения диапазона дат
   useEffect(() => {
      if (startDate && endDate) {
         // Формат даты для URL: yyyy-MM-dd
         const formatDateForUrl = (date: Date | null): string => {
            if (!date) return '';
            return format(startOfDay(date), 'yyyy-MM-dd');
         };

         getOrders(`&start_date=${formatDateForUrl(startDate)}&end_date=${formatDateForUrl(endDate)}`);
      }
   }, [dateRange]);

   // Кастомные заголовки для выбора месяца и года с расширенным диапазоном годов
   const renderCustomHeader = ({
      date,
      changeYear,
      changeMonth,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled
   }: any) => {
      // Расширенный диапазон годов с 2000 до 2100
      const years = Array.from({ length: 101 }, (_, i) => 2000 + i);

      const months = [
         "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
         "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
      ];

      return (
         <div className="datepicker-header">
            <button
               type="button"
               onClick={decreaseMonth}
               disabled={prevMonthButtonDisabled}
               className="datepicker-nav-btn"
            >
               {"<"}
            </button>

            <div className="datepicker-selects">
               <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) => changeMonth(parseInt(value))}
                  className="datepicker-select"
               >
                  {months.map((month, i) => (
                     <option key={i} value={i}>
                        {month}
                     </option>
                  ))}
               </select>

               <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(parseInt(value))}
                  className="datepicker-select"
               >
                  {years.map(year => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </select>
            </div>

            <button
               type="button"
               onClick={increaseMonth}
               disabled={nextMonthButtonDisabled}
               className="datepicker-nav-btn"
            >
               {">"}
            </button>
         </div>
      );
   };

   if (user?.role != 'admin' && user?.role != 'moder') {
      return null;
   }

   return (
      <div className="admin-order">
         <Title classes='pt'>Заказы</Title>
         {(result.loading || allDatesLoading) && <div className="loader">
            <div className="loader__circle"></div>
         </div>}

         {/* Модальные окна для успеха и ошибок */}
         <SuccessModal isOpen={isSuccessOpen} setIsOpen={setIsSuccessOpen}>
            {successMessage}
         </SuccessModal>

         <ErrorModal isOpen={isErrorOpen} setIsOpen={setIsErrorOpen}>
            {errorMessage}
         </ErrorModal>

         <div className="admin-order__header">
            <div className="admin-order__buttons">
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('') }}>
                  Все
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('add') }}>
                  Заказы
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('delete') }}>
                  Удаление
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('1') }}>
                  Новое
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('2') }}>
                  Принято
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('0') }}>
                  Отклонена
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('new') }}>
                  Сначала новые
               </button>
               <button className="btn admin-order__button" onClick={() => { setFilterHandler('old') }}>
                  Сначала старые
               </button>
            </div>
            <div className="admin-order__datepicker">
               <DatePicker
                  selected={startDate}
                  onChange={handleDateRangeChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Выберите дату"
                  locale={ru}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  highlightDates={highlightedDates}
                  renderCustomHeader={renderCustomHeader}
               />
            </div>
         </div>
         <div className="admin-order__items">
            {!result.items && <p>Ещё нет заказов</p>}
            {result.error && (
               <ErrorModal
                  isOpen={result.error}
                  setIsOpen={() => setResult(prev => ({ ...prev, error: false }))}
               >
                  Что-то пошло не так, попробуйте ещё раз
               </ErrorModal>
            )}
            <SendMessageModal
               responseLogin={responseLogin}
               setResponseLogin={setResponseLogin}
               isOpen={isOpenSend}
               setIsOpen={setIsOpenSend}
               showSuccess={handleShowSuccess}
               showError={handleShowError}
            >
               <div style={{ display: 'none' }}>Невидимый элемент</div>
            </SendMessageModal>
            {result.items && result.items.data.filter(item => {
               if (filter == 'add') {
                  return item.type == 'add'
               } else if (filter == 'delete') {
                  return item.type == 'delete'
               } else if (filter == '1') {
                  return item.status == 1
               } else if (filter == '2') {
                  return item.status == 2
               } else if (filter == '0') {
                  return item.status == 0
               }
               return item
            }).sort((a, b) => {
               if (filter == 'new') {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
               } else if (filter == 'old') {
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
               }
               return 0
            }).map(item => (
               <AdminOrdersItem openSendMessageModal={openSendMessageModal} {...item} setResult={setResult} key={item.id} />
            ))}
            {result.items && <Pagination totalPages={result.items?.totalPages} page={page} itemsLength={result.items.data ? result.items.data.length : 0} cityId={0} tagIds={[]} search={''} visiblePages={5} type={'orders'} />}
         </div>
      </div>
   )
}

export default AdminOrdersContent