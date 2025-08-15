import axios from "axios"
import { useEffect, useState } from "react"
import { IAdminSections } from "../../types/Admin"
import Layout from "../UX/Layout"
import distributeImagesByLayout from "../../utils/sectionSetting"

const AboutContent = () => {
   const apiUrl = `http://localhost:5000/sections?page_name=Про нас`
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
         {error && <p>Произошла ошибка при загрузке страницы, попробуйте ещё раз!</p>}
         {sections && distributeImagesByLayout(sections?.images, sections?.sections).map((section) => (
            <Layout key={section.id} layoutId={section.layout_id} text={section.content} urls={section.images} publicComponent={true} />
         ))}
      </>
   )
}

export default AboutContent