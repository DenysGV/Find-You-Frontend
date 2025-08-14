import Header from "../components/UX/Header";
import Footer from "../components/UX/Footer";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { IAdminSections } from "../types/Admin";
import Layout from "../components/UX/Layout";
import distributeImagesByLayout from "../utils/sectionSetting";

const NotFound = () => {
   const apiUrl = `http://62.169.27.192/api/sections?page_name=Cтранница 404`
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

   return (
      <>
         <Header activeLink="" />
         <div className="not-found-container">
            <div className="not-found-content">
               <h1>404</h1>
               <h2>Страница не найдена</h2>
               {error && <p>Произошла ошибка при загрузке страницы, попробуйте ещё раз!</p>}
               {sections && distributeImagesByLayout(sections?.images, sections?.sections).map((section) => (
                  <Layout key={section.id} layoutId={section.layout_id} text={section.content} urls={section.images} publicComponent={true} />
               ))}
               <div className="not-found-actions">
                  <Link to="/" className="btn btn-info">
                     Вернуться на главную
                  </Link>
               </div>
            </div>
         </div>
         <Footer />
      </>
   );
};

export default NotFound;