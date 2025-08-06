interface IBackendSection {
   id: number;
   layout_id: number;
   content: string;
   section_order: number;
   page_name: string;
}

interface ISectionWithImages extends IBackendSection {
   images: string[];
}

const distributeImagesByLayout = (allImages: string[], sectionsData: IBackendSection[]): ISectionWithImages[] => {
   // Используем объект для указателя, чтобы он мог быть изменен внутри цикла map
   const imagePointer = { current: 0 };

   return sectionsData.map((section: IBackendSection) => {
      let imagesForSection: string[] = [];
      const layoutId = section.layout_id;

      // Определяем, сколько изображений требуется для каждого типа макета
      // Это предположение основано на названиях макетов, которые вы предоставили.
      // Вам может потребоваться скорректировать это в соответствии с вашими реальными макетами.
      let imagesNeeded = 0;
      switch (layoutId) {
         case 0: // 'Текст | Изображение'
         case 1: // 'Изображение | Текст'
            imagesNeeded = 1;
            break;
         case 2: // 'Текст'
            imagesNeeded = 0;
            break;
         case 3: // 'Текст | 2 Изображения'
         case 4: // '2 Изображения | Текст'
         case 5: // 'Изображение | Изображение'
            imagesNeeded = 2;
            break;
         case 6: // 'Изображение | 2 Изображения'
         case 7: // '2 Изображения | Изображение'
            imagesNeeded = 3; // Предполагаем, что это 1 изображение + 2 или 2 изображения + 1
            break;
         case 8: // '3 Изображения'
            imagesNeeded = 3;
            break;
         default:
            imagesNeeded = 0;
      }

      // Назначаем изображения из общего списка
      for (let i = 0; i < imagesNeeded; i++) {
         if (imagePointer.current < allImages.length) {
            imagesForSection.push(allImages[imagePointer.current]);
            imagePointer.current++;
         } else {
            // Если изображений не хватает, прекращаем назначение
            break;
         }
      }

      return {
         ...section,
         images: imagesForSection, // Добавляем свойство 'images' к объекту секции
      };
   });
};

export default distributeImagesByLayout;