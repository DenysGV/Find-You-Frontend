import { useEffect, useState } from "react";
import { IAccountAll, IAccountsState } from "../../types/IAccounts"
import Title from "../UX/Title"
import HomeContentItem from "../home/HomeContentItem";
import axios from "axios";

const AccountSimilars = ({ account, tags }: IAccountAll) => {
   const [result, setResult] = useState<IAccountsState>({
      items: null,
      loading: false,
      error: false
   })
   const apiUrl = `http://localhost:5000/accounts?page=1&tag_id=${tags[0].id}`

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
      <div style={{ padding: '40px 0 0 0' }}>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}

         <Title>Похожие страницы</Title>
         <div className="account__items" >
            {!result.error && result.items ? result.items.map(item => {
               if (item.id == account.id) {
                  return
               } else {
                  return <HomeContentItem {...item} key={item.id} />
               }
            }) : <p>Что-то пошло не так, попробуйте ещё раз</p>}
         </div>
      </div>
   )
}

export default AccountSimilars