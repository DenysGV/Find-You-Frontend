import { useState, useMemo } from "react";
import { IAccountAll } from "../../types/IAccounts";
import GalleryModal from "../UX/modals/GalleryModal";
import VideoPlayer from "../UX/VideoPlayer";

// Функция для извлечения номера из имени файла БЕЗ ДОП. БИБЛИОТЕК
const extractFileNumber = (fileUrl: string): number => {
   try {
      // Находим индекс последнего слэша "/"
      const lastSlashIndex = fileUrl.lastIndexOf('/');
      if (lastSlashIndex === -1) {
         // Если слэша нет, возможно, это уже просто имя файла или некорректный формат
         console.warn(`Не удалось найти последний слэш в URL: ${fileUrl}`);
         return -1; // Возвращаем -1 как признак ошибки или некорректного формата
      }

      // Извлекаем строку после последнего слэша (это имя файла с возможными query params)
      const filenameWithQuery = fileUrl.substring(lastSlashIndex + 1); // Получаем "5.jpg" или "10.jpg?v=..."

      // Удаляем все после '?' или '#' на всякий случай, чтобы получить чистое имя файла
      const filename = filenameWithQuery.split('?')[0].split('#')[0]; // Получаем "5.jpg" или "10.jpg"

      // Находим индекс первой точки "." (для отделения расширения)
      const firstDotIndex = filename.indexOf('.');
      if (firstDotIndex === -1) {
         // Если точки нет, это не похоже на файл с номером и расширением
         console.warn(`Не удалось найти точку в имени файла: ${filename}`);
         return -1; // Возвращаем -1
      }

      // Берем часть строки до первой точки
      const fileNameWithoutExt = filename.substring(0, firstDotIndex); // Получаем "5" или "10"

      // Преобразуем полученную строку в целое число
      const fileNumber = parseInt(fileNameWithoutExt);

      // Проверяем, успешно ли преобразование в число
      return isNaN(fileNumber) ? -1 : fileNumber; // Возвращаем номер или -1, если результат не число
   } catch (e) {
      console.error(`Ошибка при извлечении номера из URL ${fileUrl}:`, e);
      return -1; // Возвращаем -1 при любой неожиданной ошибке
   }
};


const AccountGallery = ({ files }: IAccountAll) => {
   const [isOpen, setIsOpen] = useState(false);
   const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

   // Сортируем все файлы по номеру один раз
   const sortedFilesNumerically = useMemo(() => {
      // Делаем копию массива, чтобы не мутировать исходный пропс
      const filesCopy = [...files];
      // Сортируем по численному значению номера файла
      return filesCopy.sort((a, b) => {
         const numA = extractFileNumber(a);
         const numB = extractFileNumber(b);
         // Сортируем по номеру. Элементы без номера (-1) будут идти в конец
         return numA - numB;
      });
   }, [files]); // Зависимость от исходного массива files

   // Фильтруем только изображения из уже отсортированного массива
   const imageFiles = useMemo(() => {
      return sortedFilesNumerically.filter(item => /\.(jpg|jpeg|png|gif|webp)$/i.test(item));
   }, [sortedFilesNumerically]);

   // Фильтруем только видео из уже отсортированного массива
   const videoFiles = useMemo(() => {
      return sortedFilesNumerically.filter(item => /\.(mp4|mov|avi|mkv)$/i.test(item));
   }, [sortedFilesNumerically]); // Зависимость от численно отсортированного массива


   const openModal = (index: number) => {
      // Важно: модальное окно галереи работает только с imageFiles
      setActiveItemIndex(index);
      setIsOpen(true);
   };

   const handlePrev = () => {
      setActiveItemIndex((prev) => (prev > 0 ? prev - 1 : imageFiles.length - 1));
   };

   const handleNext = () => {
      setActiveItemIndex((prev) => (prev < imageFiles.length - 1 ? prev + 1 : 0));
   };

   return (
      <div>
         <div className="account-gallery" style={{ padding: '40px 0 0 0' }}>
            {/* Отображаем изображения из отсортированного списка */}
            {imageFiles.map((item, index) => (
               <div key={item} className="account-gallery__item" onClick={() => openModal(index)}>
                  <img src={`${item}`} alt="Image" />
               </div>
            ))}
         </div>

         <div className="account-gallery account-gallery__videos" style={{ padding: '25px 0 0 0' }}>
            {/* Отображаем видео из отсортированного списка */}
            {videoFiles.map((item, index) => (
               <div key={`video-container-${index}`} className="account-gallery__item">
                  <VideoPlayer key={`video-player-${index}`} src={`${item}`} />
               </div>
            ))}
         </div>

         {isOpen && imageFiles.length > 0 && (
            <GalleryModal
               isOpen={isOpen}
               setIsOpen={setIsOpen}
               currentIndex={activeItemIndex}
               totalImages={imageFiles.length}
               onPrev={handlePrev}
               onNext={handleNext}
            >
               {/* В модальном окне используем элемент из imageFiles по текущему индексу */}
               <img src={`${imageFiles[activeItemIndex]}`} alt="Image" />
            </GalleryModal>
         )}
      </div>
   );
};

export default AccountGallery;