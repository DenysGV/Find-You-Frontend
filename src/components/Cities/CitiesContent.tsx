import { useEffect, useState } from "react";
import ICityProps, { ICity } from "../../types/ICityProps";
import { useNavigate } from "react-router-dom";
import fetchData from "../../services/fetchData";

const CitiesContent = () => {
   const apiUrl: string = 'http://localhost:5000/cities'
   const navigate = useNavigate()
   const [result, setResult] = useState<ICityProps>({
      items: null,
      error: false,
      loading: false,
   });
   //http://localhost:5000
   useEffect(() => {
      fetchData('get', apiUrl, setResult)
   }, []);

   // Функция для группировки городов по первой букве
   const groupCitiesByLetter = (cities: ICity[]): Record<string, ICity[]> => {
      return cities.reduce((groups, city) => {
         const firstLetter = city.city_name[0].toUpperCase(); // Первая буква города
         if (!groups[firstLetter]) {
            groups[firstLetter] = [];
         }
         groups[firstLetter].push(city);
         return groups;
      }, {} as Record<string, ICity[]>); // Указываем тип для объекта
   };

   let groupedCities: Record<string, ICity[]> | null

   if (result.items) {
      groupedCities = groupCitiesByLetter(result.items);
   } else {
      groupedCities = null
   }

   const clickHandler = (id: number): void => {
      navigate(`/?page=1&city_id=${id}`)
   }

   return (
      <div className="row-fluid mb indexcontent">
         <div id="dle-content">
            {result.loading && <div className="loader">
               <div className="loader__circle"></div>
            </div>}
            {!result.loading && result.error && <p>Что-то пошло не так, попробуйте ещё раз</p>}
            {groupedCities &&
               Object.keys(groupedCities).sort().map(letter => (
                  <div key={letter}>
                     <h6 style={{ textAlign: 'left' }}>{letter}</h6>
                     <p style={{ color: '#e36f6f' }}>
                        {groupedCities[letter].map((city, index) => (
                           <span className="top_city" key={index} onClick={() => { clickHandler(city.city_id) }}>
                              {city.city_name} <sup>{city.account_count}</sup>
                              {index < groupedCities[letter].length - 1 ? ', ' : ''}
                           </span>
                        ))}
                     </p>
                  </div>
               ))
            }
         </div>
      </div>
   );
};

export default CitiesContent;
