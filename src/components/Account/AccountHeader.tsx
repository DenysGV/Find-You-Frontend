import { useEffect, useState } from "react";
import { IAccountAll, IFav } from "../../types/IAccounts"
import fetchData from "../../services/fetchData";
import axios from "axios";
import IUser from "../../types/IUser";
import AccountHeaderRating from "./AccountHeaderRating";
import dayjs from "dayjs";

const AccountHeader = ({ account, city, tags, rating }: IAccountAll) => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const apiUrlCheck = `http://167.86.84.197/api/favorites?users_id=${user?.id}`
   const apiUrlAdd = 'http://167.86.84.197/api/add-favorite'
   const apiUrlDelete = 'http://167.86.84.197/api/delete-favorite'
   const [isFav, setIsFav] = useState<boolean>(false)
   const [seccess, setSeccess] = useState<string>('')
   const [error, setError] = useState<string>('')

   const getIsFav = async () => {
      try {
         const data: IFav[] = await fetchData('get', apiUrlCheck)

         data.forEach((item: IFav) => {
            if (item.id == account.id) {
               setIsFav(true)
            }
         })
      } catch (error) {
         setError('Что-то пошло не так, попробуйте ещё раз!')
      }
   }

   const addFav = async () => {
      try {
         await axios.post(apiUrlAdd, {
            accounts_id: account.id,
            users_id: user?.id,
            comment: account.name,
         })

         setIsFav(true)
         setSeccess('Аккаунт успешно добавлен в  избранное')
      } catch (error) {
         setError('Что-то пошло не так, попробуйте ещё раз!')
      }
   }

   const removeFav = async () => {
      try {
         await axios.delete(apiUrlDelete, {
            data: {
               accounts_id: account.id,
               users_id: user?.id,
            }
         })

         setIsFav(false)
         setSeccess('Аккаунт успешно удален из  избранного')
      } catch (error) {
         setError('Что-то пошло не так, попробуйте ещё раз!')
      }
   }

   useEffect(() => {
      setIsFav(false)
      getIsFav()
      setSeccess('')
      setError('')
   }, [account.id])

   return (
      <div className="account-header" >
         <div className="">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {seccess && <p style={{ color: 'green' }}>{seccess}</p>}
            <p>Дата добавления: <span style={{ color: '#e36f6f' }}>{
               dayjs(new Date(account.date_of_create)).format("DD.MM.YYYY")
            }</span> / Город: <span style={{ color: '#e36f6f' }}>{
               city.name_ru
            }</span> / Закладки
               {isFav ? <svg style={{ margin: '0 0 -5px 5px', cursor: 'pointer' }} onClick={removeFav} width="20" height="20" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M56.875 8.75H13.125C10.7088 8.75 8.75 10.7088 8.75 13.125V56.875C8.75 59.2912 10.7088 61.25 13.125 61.25H56.875C59.2912 61.25 61.25 59.2912 61.25 56.875V13.125C61.25 10.7088 59.2912 8.75 56.875 8.75Z" stroke="#E36F6F" strokeWidth="5" strokeLinejoin="round" />
                  <path d="M23.3333 35H46.6667" stroke="#E36F6F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
               </svg> : <svg style={{ margin: '0 0 -5px 5px', cursor: 'pointer' }} onClick={addFav} width="20" height="20" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M56.875 8.75H13.125C10.7088 8.75 8.75 10.7088 8.75 13.125V56.875C8.75 59.2912 10.7088 61.25 13.125 61.25H56.875C59.2912 61.25 61.25 59.2912 61.25 56.875V13.125C61.25 10.7088 59.2912 8.75 56.875 8.75Z" stroke="#4CAF50" strokeWidth="5" strokeLinejoin="round" />
                  <path d="M35 23.3333V46.6667M23.3333 35H46.6667" stroke="#4CAF50" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>}
            </p>
            <p>Тэги: {
               tags.map(item => `${item.name_ru} `)
            }</p>
         </div>
         <AccountHeaderRating rating={rating} setSeccess={setSeccess} setError={setError} />
      </div >
   )
}

export default AccountHeader