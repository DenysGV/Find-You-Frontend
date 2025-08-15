import { useEffect, useState } from "react"
import { IAdminSections } from "../../types/Admin"
import axios from "axios"
import Layout from "../UX/Layout"
import distributeImagesByLayout from "../../utils/sectionSetting"

const ReferralContent = () => {
   const apiUrl = `http://localhost:5000/sections?page_name=Реферальная система`
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

export default ReferralContent