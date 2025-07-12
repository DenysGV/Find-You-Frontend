import { Link } from 'react-router-dom';

const Header = ({ activeLink }: { activeLink?: string }) => {

   // Функция для обработки клика по ссылке и установки активного элемента


   return (
      <div>
         <div className="visible-desktop navbar navbar-fixed-top" >
            <div className="navbar-inner">
               <div className="layout-container ">
                  <span className="brand pt25">
                     <Link to="/"><h1>Check You Tea</h1>{/*<img src='/images/logoHeader.png' className='logo' />*/}</Link>
                  </span>
                  <ul className="nav pt pull-right">
                     <li className={activeLink === 'Home' ? 'active' : ''}>
                        <Link to="/">Главная</Link>
                     </li>
                     <li className={activeLink === 'Cities' ? 'active' : ''}>
                        <Link to="/Cities">Города</Link>
                     </li>
                     <li className={activeLink === 'Tags' ? 'active' : ''}>
                        <Link to="/Tags">Тэги</Link>
                     </li>
                     <li className={activeLink === 'Orders' ? 'active' : ''}>
                        <Link to="/Order">Заказы</Link>
                     </li>
                     {/*<li className={activeLink === 'Delete' ? 'active' : ''}>
                        <Link to="/Delete">Удаление</Link>
                     </li>
                     <li className={activeLink === 'Access' ? 'active' : ''}>
                        <Link to="/Access">Бесплатный доступ</Link>
                     </li>
                     <li className={activeLink === 'Mirrors' ? 'active' : ''}>
                        <Link to="/Mirrors">Зеркала</Link>
                     </li>*/}
                     <li className={activeLink === 'About' ? 'active' : ''}>
                        <Link to="/About">О проекте</Link>
                     </li>
                  </ul>
               </div>
            </div>
         </div>

         <div className="jumbotron-mob hidden-desktop">
            <div className="layout-container">
               <span>
                  <Link to="/">Check You Tea{/*<img src='/images/logoHeader.png' className='logo' />*/}</Link>
               </span>
               <div className="nav header-mobile__menu">
                  <li className={activeLink === 'Home' ? 'active' : ''}>
                     <Link to="/">Главная</Link>
                  </li>
                  <li className={activeLink === 'Cities' ? 'active' : ''}>
                     <Link to="/Cities">Города</Link>
                  </li>
                  <li className={activeLink === 'Tags' ? 'active' : ''}>
                     <Link to="/Tags">Тэги</Link>
                  </li>
                  <li className={activeLink === 'Order' ? 'active' : ''}>
                     <Link to="/Order">Заказы</Link>
                  </li>
                  {/*<li className={activeLink === 'Delete' ? 'active' : ''}>
                     <Link to="/Delete">Удаление</Link>
                  </li>
                  <li className={activeLink === 'Access' ? 'active' : ''}>
                     <Link to="/Access">Бесплатный доступ</Link>
                  </li>
                  <li className={activeLink === 'Mirrors' ? 'active' : ''}>
                     <Link to="/Mirrors">Зеркала</Link>
                  </li>*/}
                  <li className={activeLink === 'About' ? 'active' : ''}>
                     <Link to="/About">О проекте</Link>
                  </li>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Header