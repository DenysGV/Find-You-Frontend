import { useEffect, useState } from "react";
import IUser from "../../types/IUser";
import fetchData from "../../services/fetchData";
import ICommentsState from "../../types/ICommentsState";
import CommentsContentItem from "./CommentsContentItem";

const CommentsContent = () => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const apiUrlCheck = `http://localhost:5000/comments?user_id=${user?.id}`
   const [result, setResult] = useState<ICommentsState>({
      items: null,
      loading: false,
      error: false,
   })

   const getComments = async () => {
      await fetchData('get', apiUrlCheck, setResult)
   }


   console.log(result.items);

   useEffect(() => {
      getComments()
   }, [])

   return (
      <>
         <div className="comments__items">
            {result.loading && <div className="loader">
               <div className="loader__circle"></div>
            </div>}
            {result.items && !result.error ? (
               result.items.map(item => (
                  <CommentsContentItem {...item} setResult={setResult} key={item.id} />
               ))
            ) : <p>Что-то пошло не так, попробуйте ещё раз!</p >}
         </div>
         {!result.items?.length && <p>Вы ещё не добавили ничего в закладки</p >}
      </>
   )
}

export default CommentsContent