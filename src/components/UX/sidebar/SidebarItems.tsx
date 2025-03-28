import { useEffect, useState } from "react";
import Title from "../Title"
import { IAccountsState } from "../../../types/IAccounts";
import HomeContentItem from "../../home/HomeContentItem";

const SidebarItems = ({ fetchData }: { fetchData: (method: 'post' | 'get', url: string, setState: Function) => void }) => {
   let apiUrl = `http://167.86.84.197:5000/accounts?page=1&limit=10`;
   const [result, setResult] = useState<IAccountsState>({
      items: null,
      loading: false,
      error: false
   })

   useEffect(() => {
      fetchData('get', apiUrl, setResult)
   }, [])

   return (
      <div>
         <Title classes="">ТОП АККАУНТОВ ЗА НЕДЕЛЮ</Title>
         <div className="sidebar-items">
            {result.loading && <div className="loader">
               <div className="loader__circle"></div>
            </div>}
            {!result.loading && result.error && <p>Что-то пошло не так, попробуйте ещё раз</p>}
            {result.items && result.items.map((item) => (
               <HomeContentItem {...item} key={item.id} />
            ))}
         </div>
      </div>
   )
}

export default SidebarItems