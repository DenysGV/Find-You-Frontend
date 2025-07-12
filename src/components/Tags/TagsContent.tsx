import axios from "axios";
import { useEffect, useState } from "react";
import ITagsProps, { ITag } from "../../types/ITagsProps";
import { useNavigate } from "react-router-dom";

const TagsContent = () => {
   const apiUrl: string = 'https://check-you.blog/api/tags'
   const navigate = useNavigate()
   const [result, setResult] = useState<ITagsProps>({
      items: null,
      error: false,
      loading: false,
   });

   const fetchData = async () => {
      try {
         setResult(prev => ({ ...prev, loading: true }))

         const response = await axios.get(apiUrl);

         setResult({
            items: response.data.sort((a: ITag, b: ITag) => b.usage_count - a.usage_count),
            loading: false,
            error: false
         })
      } catch (error) {
         setResult({
            items: null,
            loading: false,
            error: true
         })
      }
   };

   useEffect(() => {
      fetchData()
   }, []);

   const clickHandler = (id: number): void => {
      navigate(`/?page=1&tag_id=${id}`)
   }

   return (
      <div className="row-fluid mb indexcontent">
         <div id="dle-content">
            {result.loading && <div className="loader">
               <div className="loader__circle"></div>
            </div>}
            {!result.loading && result.error && <p>Что-то пошло не так, попробуйте ещё раз</p>}
            {result.items &&
               <p style={{ color: '#e36f6f', cursor: 'pointer' }}>
                  {result.items.map((tag, index) => (
                     tag.usage_count > 0 && <span key={index} onClick={() => { clickHandler(tag.id) }}>
                        <span>{tag.name_ru} <sup>{tag.usage_count}</sup> , </span>
                     </span>
                  ))}
               </p>
            }
         </div>
      </div>
   )
}

export default TagsContent