import { useEffect, useState } from "react";
import Pagination from "../UX/Pagination";
import Sidebar from "../UX/sidebar/Sidebar";
import Title from "../UX/Title";
import UpButton from "../UX/UpButton";
import HomeContent from "./HomeContent";
import axios from "axios";
import { IAccountsState } from "../../types/IAccounts";

const HomeMain = ({ pageNumber, cityId, tagIds, search, dateRange, sortByRating }: {
   pageNumber: number,
   cityId?: number,
   tagIds?: number[],
   search?: string,
   dateRange?: [Date, Date],
   sortByRating?: boolean
}) => {
   const [totalPages, setTotalPages] = useState<number>(1);
   const visiblePages: number = 5;

   let apiUrl = `https://check-you.blog/api/accounts?page=${pageNumber}`;
   if (cityId) apiUrl += `&city_id=${cityId}`;
   if (tagIds && tagIds.length > 0) apiUrl += `&tag_id=${tagIds.join(",")}`;
   if (search) apiUrl += `&search=${search}`;
   if (sortByRating) apiUrl += `&sort_by_rating=true`;

   if (dateRange && dateRange.length === 2) {
      const formattedDates = dateRange.map(date => {
         const parsedDate = date instanceof Date ? date : new Date(date);
         return parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
      });
      apiUrl += `&date_range=${encodeURIComponent(JSON.stringify(formattedDates))}`;
   }

   const [result, setResult] = useState<IAccountsState>({
      items: null,
      loading: false,
      error: false
   });

   console.log(result.items);

   const fetchData = async () => {
      try {
         setResult(prev => ({ ...prev, loading: true }));
         const response = await axios.get(apiUrl);
         setTotalPages(response.data.totalPages || 1);
         setResult({
            items: response.data.accounts,
            loading: false,
            error: false
         });
      } catch (error) {
         setResult({
            items: null,
            loading: false,
            error: true
         });
      }
   };

   useEffect(() => {
      fetchData();
   }, [pageNumber, dateRange]);

   return (
      <div className="layout-container">
         <UpButton />
         <div className="layout-row">
            <div className="col-10">
               <div>
                  <Title classes='pt'>
                     {cityId ? 'ПО ГОРОДУ' :
                        tagIds ? 'ПО ТЭГУ' :
                           search ? `ПО ПОИСКУ: ${search} ${Number(search) ? 'лет' : ''}` :
                              sortByRating ? 'ТОП ПО РЕЙТИНГУ' :
                                 'Новое'}
                  </Title>
                  <div className="row-fluid mb indexcontent">
                     <HomeContent {...result} />
                     <Pagination
                        itemsLength={result.items ? result.items.length : 0}
                        page={pageNumber}
                        totalPages={totalPages}
                        cityId={cityId}
                        tagIds={tagIds}
                        search={search}
                        sortByRating={sortByRating}
                        visiblePages={visiblePages}
                     />
                  </div>
               </div>
            </div>
            <Sidebar />
         </div>
      </div>
   );
};

export default HomeMain;