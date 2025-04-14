import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IAccount } from "../../types/IAccounts";
import Pagination from "../UX/Pagination";
import AdminAccountsEditItem from "./AdminAccountsEditItem";

const AdminAccountsEdit = () => {
   const apiUrlGet = 'http://167.86.84.197:5000/account'
   const apiUrlDeleteAccounts = 'http://167.86.84.197:5000/delete-accounts'
   const apiUrlUpdate = 'http://167.86.84.197:5000/update-photo'
   const apiUrlDateUpdate = 'http://167.86.84.197:5000/update-account-date'
   const apiUrlAccUpdate = 'http://167.86.84.197:5000/update-account'
   const apiUrl = 'http://167.86.84.197:5000'
   const [accounts, setAccounts] = useState<IAccount[] | null>(null)
   const [accountsSelected, setAccountsSelected] = useState<number[]>([])
   const [success, setSuccess] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<string>('');
   const [totalPages, setTotalPages] = useState<number>(1);
   const [searchParams] = useSearchParams();
   const page = Number(searchParams.get("page")) || 1;
   const search = searchParams.get("search") || '';
   const [searchInput, setSearchInput] = useState<string>(search);
   const navigate = useNavigate()

   const getAccountsHandler = async () => {
      setError('')
      setSuccess('')

      let apiUrlAccouts = `http://167.86.84.197:5000/accounts?page=${page}&limit=20`;
      if (searchInput) apiUrlAccouts += `&search=${searchInput}`;

      try {
         const result = await axios.get(`${apiUrlAccouts}`)

         setTotalPages(result.data.totalPages || 1);

         setAccounts(result.data.accounts)
      } catch (error) {
         setError('Ошибка при получении аккаунтов, попробуйте ещё раз!')
      }
   }

   const deleteAccountsHandler = async () => {
      try {
         setError('')
         setSuccess('')
         setLoading(true)

         await axios.delete(apiUrlDeleteAccounts, {
            data: {
               account_ids: accountsSelected,
            }
         })

         setSuccess('Аккаунты успешно удалены')
         setLoading(false)
         accountsSelected.forEach(itemSelected => {
            setAccounts(prev => prev && prev.filter(item => item.id != itemSelected))
         })
         setAccountsSelected([])
      } catch (error) {
         setLoading(false)
         setError('Ошибка при удалении аккаунтов, попробуйте ещё раз!')
      }
   }

   useEffect(() => {
      getAccountsHandler()
   }, [page, search])

   return (
      <div className="admin-accounts-get">
         {loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {success && <p style={{ color: 'green' }}>{success}</p>}
         <form className="admin-accounts-get__form" onSubmit={(e) => { e.preventDefault(); navigate(`/admin-accounts?page=1&search=${searchInput}`) }}>
            <input type="text" placeholder="Поиск..." onChange={(e) => { setSearchInput(e.target.value) }} />
            <button className="btn btn-info">Получить</button>
         </form>

         <div className="admin-accounts-get__toolbar">
            {accountsSelected.length > 0 && <svg onClick={deleteAccountsHandler} width="35" height="35" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M15 47.5C15 48.8261 15.5268 50.0979 16.4645 51.0355C17.4021 51.9732 18.6739 52.5 20 52.5H40C41.3261 52.5 42.5979 51.9732 43.5355 51.0355C44.4732 50.0979 45 48.8261 45 47.5V17.5H15V47.5ZM20 22.5H40V47.5H20V22.5ZM38.75 10L36.25 7.5H23.75L21.25 10H12.5V15H47.5V10H38.75Z" fill="#E36F6F" />
            </svg>}
         </div>
         <div className="account__items admin-accounts-edit">
            {accounts && accounts.map(item => {
               return <AdminAccountsEditItem
                  account={{ ...item }}
                  setAccountsSelected={setAccountsSelected}
                  key={item.id}
                  apiUrl={apiUrl}
                  apiUrlGet={apiUrlGet}
                  apiUrlUpdate={apiUrlUpdate}
                  apiUrlDateUpdate={apiUrlDateUpdate}
                  apiUrlAccUpdate={apiUrlAccUpdate}
                  setError={setError}
                  setSuccess={setSuccess}
               />
            })}
         </div>
         <Pagination itemsLength={accounts ? accounts.length : 0} page={page} totalPages={totalPages} cityId={0} tagIds={[]} search={search} visiblePages={5} type={'admin'} />
      </div>
   )
}

export default AdminAccountsEdit