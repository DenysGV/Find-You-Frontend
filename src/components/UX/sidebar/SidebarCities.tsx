import { useEffect, useState } from "react"
import Title from "../Title"
import ICityProp from "../../../types/ICityProps";
import IUser from "../../../types/IUser";
import ISidebarCities from "../../../types/ISidebarCities";
import ICheckUser from "../../../types/ICheckUser";
import IFetchData from "../../../types/IFetchData";
import api from "../../../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const SidebarCities = ({ setUserCheck }: ISidebarCities) => {
   let apiUrl = `http://62.169.27.192/api/cities`;
   const navigate = useNavigate()
   const [result, setResult] = useState<ICityProp>({
      items: null,
      error: false,
      loading: false,
   });

   const token: string | null = localStorage.getItem("token")
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const fetchData = async (checkUser: ICheckUser) => {
      try {
         setResult((prev: IFetchData) => ({ ...prev, loading: true }))

         const response = await api.get(apiUrl, {
            headers: { Authorization: `Bearer ${checkUser.token}`, IsAuth: checkUser.isAuth }
         });

         setResult({
            items: response.data,
            loading: false,
            error: false
         })
         setUserCheck(true)

      } catch (error: any) {
         if (error.status === 401) {
            localStorage.removeItem("token"); // Удаляем токен
            localStorage.removeItem('user');
            navigate('/')
         }
         setResult({
            items: null,
            loading: false,
            error: true
         })
         return null
      }
   };

   useEffect(() => {
      fetchData({ token, isAuth: !!user })
   }, [])

   return (
      <div>
         <Title classes="">ТОП ГОРОДОВ</Title>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         {!result.loading && result.error && <p>Что-то пошло не так, попробуйте ещё раз</p>}
         {result.items && result.items.sort((a, b) => (b.account_count - a.account_count)).map((item, index) =>
            index < 10 && <p key={index} className="top_city" onClick={() => { navigate(`/?page=1&city_id=${item.city_id}`) }}>{item.city_name} <span className="top_city_counter">{item.account_count}</span></p>
         )}
      </div>
   )
}

export default SidebarCities