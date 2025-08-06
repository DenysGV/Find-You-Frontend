import { useEffect, useState } from "react"
import IUser from "../../types/IUser";
import fetchData from "../../services/fetchData";
import IFavoritesState from "../../types/IFavoritesState";
import HomeContentItem from "../home/HomeContentItem";
import Title from "../UX/Title";

const FavoritesContent = () => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const apiUrlCheck = `http://localhost:5000/favorites?users_id=${user?.id}`
   const [result, serResult] = useState<IFavoritesState>({
      items: null,
      loading: false,
      error: false,
   })

   const getIsFav = async () => {
      await fetchData('get', apiUrlCheck, serResult)
   }

   useEffect(() => {
      getIsFav()
   }, [])

   return (
      <>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         {!!result.items?.length && <Title classes='pt'>Закладки</Title>}
         <div className="fav__items">
            {result.items && !result.error ? (
               result.items.map(item => (
                  <HomeContentItem {...item} key={item.id} />
               ))
            ) : <p>Что-то пошло не так, попробуйте ещё раз!</p >}
         </div>
         {!result.items?.length && <div className="fav__warning">
            <h5>Информация</h5>
            <p>Вы ничего не вносили в свои закладки</p>
         </div>}
      </>
   )
}

export default FavoritesContent