import { useEffect, useState } from "react"
import { ILayout } from "../../types/Admin" // Убедитесь, что путь правильный

const Layout = ({ layoutId, text, urls }: ILayout) => {
   // Названия макетов, соответствуют layoutId
   const layoutNames: string[] = [
      'Текст | Изображение',
      'Изображение | Текст',
      'Текст',
      'Текст | 2 Изображения',
      '2 Изображения | Текст',
      'Изображение | Изображение',
      'Изображение | 2 Изображения',
      '2 Изображения | Изображение',
      '3 Изображения'
   ];

   // Состояние для разделения названия макета на части (например, ['Текст', 'Изображение'])
   const [layoutParts, setLayoutParts] = useState<string[]>([]);

   // Базовый URL для изображений, если они относительные
   const basicUrl = 'https://check-you.blog/api';

   // Обрабатываем URL-адреса изображений, чтобы они всегда были полными
   // Это гарантирует, что изображения загружаются правильно как на публичных страницах, так и в админ-панели.
   const processedUrls = urls.map(item => {
      // Проверяем, является ли URL уже полным (например, blob: для новых файлов или уже содержит http://)
      if (item.startsWith('http://') || item.startsWith('blob:')) {
         return item;
      }
      // Если URL относительный, добавляем базовый URL бэкенда
      return `${basicUrl}${item}`;
   });

   // Обновляем части макета при изменении layoutId
   useEffect(() => {
      setLayoutParts(layoutNames[layoutId].split(' | '));
   }, [layoutId, layoutNames]); // Добавил layoutNames в зависимости, хотя он константа

   // Вспомогательная функция для получения URL изображения по индексу
   // Используем 'processedUrls' вместо 'urls'
   const getImageUrl = (index: number) => processedUrls[index] || '/images/blog_image.jpg';

   return (
      <div className={`layout-container layout-${layoutId + 1}`}>
         <div className="layout-row">
            {/* Рендерим первый элемент макета */}
            {layoutParts[0] === 'Текст' && (
               <div className="layout-text">
                  <p dangerouslySetInnerHTML={{ __html: text || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis consequatur sed est eos vero, blanditiis quia iusto incidunt error nulla iure quo cumque vel quisquam veritatis inventore aperiam rem qui beatae. Cupiditate saepe eaque aperiam quo inventore ex minima minus expedita distinctio numquam? Sint mollitia excepturi, dicta nulla iste illo veniam optio facere quas ea fugit earum rerum deserunt voluptatem, dolores culpa fugiat, ipsum esse voluptates molestias ipsam possimus consequuntur ullam vitae! Consequatur pariatur, doloremque illum facilis ratione quod nihil. Aperiam consequatur placeat voluptatum illum consectetur earum architecto, assumenda, in ad veritatis rerum quod ut. Enim consectetur deleniti animi itaque?" }} />
               </div>
            )}
            {layoutParts[0] === 'Изображение' && (
               <div className="layout-img">
                  <img src={getImageUrl(0)} alt="" />
               </div>
            )}
            {layoutParts[0] === '2 Изображения' && (
               <div className="layout-img layout-img__double">
                  <img src={getImageUrl(0)} alt="" />
                  <img src={getImageUrl(1)} alt="" />
               </div>
            )}
            {layoutParts[0] === '3 Изображения' && ( // Для макета с 3 изображениями, все в первой "части"
               <>
                  <div className="layout-img">
                     <img src={getImageUrl(0)} alt="" />
                  </div>
                  <div className="layout-img">
                     <img src={getImageUrl(1)} alt="" />
                  </div>
                  <div className="layout-img">
                     <img src={getImageUrl(2)} alt="" />
                  </div>
               </>
            )}

            {/* Рендерим второй элемент макета, если он есть */}
            {layoutParts[1] && (
               <>
                  {layoutParts[1] === 'Текст' && (
                     <div className="layout-text">
                        <p dangerouslySetInnerHTML={{ __html: text || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis consequatur sed est eos vero, blanditiis quia iusto incidunt error nulla iure quo cumque vel quisquam veritatis inventore aperiam rem qui beatae. Cupiditate saepe eaque aperiam quo inventore ex minima minus expedita distinctio numquam? Sint mollitia excepturi, dicta nulla iste illo veniam optio facere quas ea fugit earum rerum deserunt voluptatem, dolores culpa fugiat, ipsum esse voluptates molestias ipsam possimus consequuntur ullam vitae! Consequatur pariatur, doloremque illum facilis ratione quod nihil. Aperiam consequatur placeat voluptatum illum consectetur earum architecto, assumenda, in ad veritatis rerum quod ut. Enim consectetur deleniti animi itaque?" }} />
                     </div>
                  )}
                  {layoutParts[1] === 'Изображение' && (
                     <div className="layout-img">
                        {/* Индекс для второго изображения зависит от того, сколько изображений было в первой части */}
                        <img src={getImageUrl(layoutParts[0] === 'Текст' ? 0 : 1)} alt="" />
                     </div>
                  )}
                  {layoutParts[1] === '2 Изображения' && (
                     <div className="layout-img layout-img__double">
                        {/* Индексы для двух изображений во второй части */}
                        <img src={getImageUrl(layoutParts[0] === 'Текст' ? 0 : 1)} alt="" />
                        <img src={getImageUrl(layoutParts[0] === 'Текст' ? 1 : 2)} alt="" />
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   )
}

export default Layout;