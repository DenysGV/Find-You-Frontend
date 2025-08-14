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
   const apiUrl = `http://62.169.27.192/api/accounts?page=1&tag_id=${tags[0].id}`

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
   }, [account])

   return (
      <div style={{ padding: '40px 0 0 0' }}>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}

         <Title>Похожие страницы</Title>
         <div className="account__items" >
            {!result.error && result.items ? result.items.filter(item => {
               if (!item.date_of_create) return false
               if (new Date(item.date_of_create) > new Date()) return false

               return true
            }).slice(0, 4).map(item => {
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