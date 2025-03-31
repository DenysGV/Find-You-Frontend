import { useEffect, useState } from "react";
import Title from "../Title"
import { IAccountsState } from "../../../types/IAccounts";
import HomeContentItem from "../../home/HomeContentItem";
import axios from "axios";

const SidebarItems = ({ fetchData }: { fetchData: (method: 'post' | 'get', url: string, setState: Function) => void }) => {
   let apiUrl = `http://localhost:5000/accounts?page=1&limit=10`;
   const [result, setResult] = useState<IAccountsState>({
      items: null,
      loading: false,
      error: false
   })

   const getData = async () => {
      try {
         setResult((prev) => ({ ...prev, loading: true }))

         const response = await axios.get(apiUrl);

         setResult({
            items: response.data.accounts,
            loading: false,
            error: false
         })

      } catch (error: any) {
         setResult({
            items: null,
            loading: false,
            error: true
         })
      }
   }

   useEffect(() => {
      getData()
   }, [])

   return (
      <div>
         <Title classes="">ТОП АККАУНТОВ ЗА НЕДЕЛЮ</Title>
         <div className="sidebar-items">
            {result.loading && <div className="loader">
               <div className="loader__circle"></div>
            </div>}
            {!result.loading && result.error && <p>Что-то пошло не так, попробуйте ещё раз</p>}
            {result.items && result.items.map((item) => {
               if (item.date_of_create && new Date(item.date_of_create) < new Date()) {
                  return <HomeContentItem {...item} key={item.id} />
               }
            })}
         </div>
      </div>
   )
}

export default SidebarItems