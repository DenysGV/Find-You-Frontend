import { useEffect, useState } from "react"
import { ILayout } from "../../types/Admin"

const Layout = ({ layoutId, text, urls, publicComponent }: ILayout) => {
   const layoutNames: string[] = ['Текст | Изображение', 'Изображение | Текст', 'Текст', 'Текст | 2 Изображения', '2 Изображения | Текст', 'Изображение | Изображение', 'Изображение | 2 Изображения', '2 Изображения | Изображение', '3 Изображения']
   const [layout, setLayout] = useState<string[]>([])
   const basicUrl = 'https://check-you.blog/api'

   if (publicComponent) {
      urls = urls.map(item => `${basicUrl}${item}`)
   }

   useEffect(() => {
      setLayout(layoutNames[layoutId].split(' | '))
   }, [layoutId])

   return (
      <div className={`layout-container layout-${layoutId + 1}`}>
         <div className="layout-row">
            {
               layout[0] == 'Текст' && <div className="layout-text">
                  <p dangerouslySetInnerHTML={{ __html: text || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis consequatur sed est eos vero, blanditiis quia iusto incidunt error nulla iure quo cumque vel quisquam veritatis inventore aperiam rem qui beatae. Cupiditate saepe eaque aperiam quo inventore ex minima minus expedita distinctio numquam? Sint mollitia excepturi, dicta nulla iste illo veniam optio facere quas ea fugit earum rerum deserunt voluptatem, dolores culpa fugiat, ipsum esse voluptates molestias ipsam possimus consequuntur ullam vitae! Consequatur pariatur, doloremque illum facilis ratione quod nihil. Aperiam consequatur placeat voluptatum illum consectetur earum architecto, assumenda, in ad veritatis rerum quod ut. Enim consectetur deleniti animi itaque?" }} />               </div>
            }
            {
               layout[0] == 'Изображение' && <div className="layout-img">
                  <img src={`${urls[0] || '/images/blog_image.jpg'}`} alt="" />
               </div>
            }
            {
               layout[0] == '2 Изображения' && <div className="layout-img layout-img__double">
                  <img src={`${urls[0] || '/images/blog_image.jpg'}`} alt="" />
                  <img src={`${urls[1] || '/images/blog_image.jpg'}`} alt="" />
               </div>
            }
            {
               layout[1] == 'Текст' && <div className="layout-text">
                  <p dangerouslySetInnerHTML={{ __html: text || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis consequatur sed est eos vero, blanditiis quia iusto incidunt error nulla iure quo cumque vel quisquam veritatis inventore aperiam rem qui beatae. Cupiditate saepe eaque aperiam quo inventore ex minima minus expedita distinctio numquam? Sint mollitia excepturi, dicta nulla iste illo veniam optio facere quas ea fugit earum rerum deserunt voluptatem, dolores culpa fugiat, ipsum esse voluptates molestias ipsam possimus consequuntur ullam vitae! Consequatur pariatur, doloremque illum facilis ratione quod nihil. Aperiam consequatur placeat voluptatum illum consectetur earum architecto, assumenda, in ad veritatis rerum quod ut. Enim consectetur deleniti animi itaque?" }} />
               </div>
            }
            {
               layout[1] == 'Изображение' && <div className="layout-img">
                  <img src={`${urls[layout[0] == 'Изображение' ? 1 : layout[0] == '2 Изображения' ? 2 : 0] || '/images/blog_image.jpg'}`} alt="" />
               </div>
            }
            {
               layout[1] == '2 Изображения' && <div className="layout-img layout-img__double">
                  <img src={`${urls[layout[0] == 'Изображение' ? 1 : 0] || '/images/blog_image.jpg'}`} alt="" />
                  <img src={`${urls[layout[0] == 'Изображение' ? 2 : 1] || '/images/blog_image.jpg'}`} alt="" />
               </div>
            }
            {
               layout[0] == '3 Изображения' && <><div className="layout-img">
                  <img src={`${urls[0] || '/images/blog_image.jpg'}`} alt="" />
               </div><div className="layout-img">
                     <img src={`${urls[1] || '/images/blog_image.jpg'}`} alt="" />
                  </div><div className="layout-img">
                     <img src={`${urls[2] || '/images/blog_image.jpg'}`} alt="" />
                  </div>
               </>
            }
         </div>
      </div>
   )
}

export default Layout