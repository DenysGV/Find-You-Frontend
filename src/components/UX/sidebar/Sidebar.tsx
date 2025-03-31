import Title from "../Title";
import SidebarSearch from "./SidebarSearch";
import SidebarCities from "./SidebarCities";
import SidebarItems from "./SidebarItems";
import { useEffect, useState } from "react";
import IUser from "../../../types/IUser";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import IMessage from "../../../types/IMessage";
import LoginModal from "../modals/LoginModal";
import transformPhoto from "../../../utils/transformPhoto";
import ChangeAvatarModal from "../modals/ChangeAvatarModal";

const Sidebar = () => {
   const navigate = useNavigate()
   const [isOpenLogin, setIsOpenLogin] = useState<boolean>(false);
   const [isChange, setIsChange] = useState<boolean>(false);
   const storedUser = localStorage.getItem('user');
   let user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const [userCheck, setUserCheck] = useState<boolean>(false)
   const apiUrlCheck = `http://167.86.84.197:5000/favorites?users_id=${user?.id}`
   const [favQnt, setFavQnt] = useState<number>(0)
   const [messagesQnt, setMessagesQnt] = useState<number>(0)
   const apiUrlGetMessages = `http://167.86.84.197:5000/get-messages?user_id=${user?.id}`

   const getIsFav = async () => {
      try {
         const result = await axios.get(apiUrlCheck)

         setFavQnt(result.data.length)
      } catch (error) {
      }
   }

   const getMessages = async () => {
      try {
         const result = await axios.get(apiUrlGetMessages)

         const filtredArr = result.data.filter((item: IMessage) => item.sender != user?.login)

         setMessagesQnt(filtredArr.length)
      } catch (error) {
      }
   }

   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem('user');
      navigate('/')
   }

   useEffect(() => {
      if (user) {
         getIsFav()
         getMessages()
      }
   }, [isOpenLogin])
   useEffect(() => {
      user = storedUser ? JSON.parse(storedUser) : null;
   }, [userCheck])

   return (
      <div className="sidebar">
         <br />
         <SidebarSearch />

         <br />
         <Title classes="pt">Обход блокировок</Title>
         <p>Самая актуальная: <br /> информация по <span style={{ color: "#f47a6d", cursor: 'pointer' }} onClick={() => { navigate('/bypassing') }}>ссылке</span></p>

         <Title classes="">Личный кабинет</Title>

         {user ?
            <div className="sidebar-user">
               <div className="sidebar-user__profile">
                  <p>Привет, друг: {user.login}</p>
                  <div className="sidebar-user__avatar">
                     <div className="sidebar-user__photo">
                        {user.avatar ? <img src={transformPhoto(user.avatar)} /> : <svg width="35" height="35" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M7.29748 61.5869C7.29957 61.7363 7.33107 61.8838 7.39018 62.021C7.44928 62.1582 7.53484 62.2824 7.64196 62.3865C7.74908 62.4907 7.87566 62.5727 8.01448 62.6279C8.1533 62.6831 8.30164 62.7105 8.45102 62.7083H61.5446C61.6941 62.7106 61.8426 62.6835 61.9815 62.6283C62.1205 62.5732 62.2473 62.4912 62.3546 62.3871C62.4618 62.2829 62.5475 62.1586 62.6067 62.0213C62.6659 61.884 62.6975 61.7364 62.6996 61.5869V60.2481C62.7258 59.8442 62.7798 57.8317 61.4527 55.6048C60.6156 54.2004 59.4008 52.9885 57.8419 51.9998C55.9562 50.804 53.5573 49.9392 50.6552 49.4185C49.1819 49.2119 47.7206 48.9276 46.2773 48.5669C42.4389 47.5869 42.1035 46.7192 42.1006 46.7104C42.078 46.6249 42.0457 46.5422 42.0044 46.464C41.9723 46.3035 41.895 45.694 42.0437 44.0621C42.42 39.916 44.6439 37.466 46.4304 35.4973C46.9933 34.8775 47.5256 34.2898 47.9354 33.7152C49.7044 31.236 49.8677 28.4142 49.875 28.2392C49.8817 27.9291 49.8388 27.6199 49.7481 27.3233C49.5731 26.7837 49.2479 26.4483 49.0087 26.2004C48.9522 26.1436 48.8973 26.0852 48.8439 26.0254C48.8264 26.005 48.7798 25.9496 48.8221 25.671C48.9651 24.7737 49.0639 23.8699 49.1181 22.9629C49.1998 21.5017 49.2625 19.3171 48.8848 17.1894C48.8295 16.7829 48.7456 16.3809 48.6339 15.9862C48.2373 14.5211 47.5956 13.2718 46.7089 12.2383C46.5558 12.0706 42.84 8.155 32.0527 7.35291C30.5608 7.24208 29.0864 7.30187 27.6339 7.37625C27.2044 7.38589 26.7769 7.43866 26.3579 7.53375C25.2437 7.82104 24.9462 8.52687 24.8689 8.92208C24.7391 9.57833 24.9666 10.0858 25.1169 10.4242C25.1387 10.4723 25.1664 10.5321 25.1183 10.6896C24.8689 11.0775 24.4737 11.4275 24.0727 11.7585C23.956 11.8562 21.2523 14.1896 21.1035 17.236C20.7025 19.5533 20.7316 23.1627 21.2056 25.6579C21.2348 25.7965 21.2741 26.0006 21.2085 26.1392C20.6981 26.5956 20.1206 27.1133 20.1221 28.2946C20.1279 28.4142 20.2927 31.2346 22.0616 33.7152C22.47 34.2898 23.0023 34.876 23.5637 35.4958L23.5666 35.4973C25.3531 37.466 27.5771 39.916 27.9533 44.0606C28.1006 45.694 28.0233 46.3021 27.9927 46.464C27.9509 46.5421 27.9181 46.6248 27.895 46.7104C27.8935 46.7192 27.5596 47.584 23.7387 48.5625C21.5337 49.1269 19.3637 49.4156 19.2981 49.4229C16.4777 49.8998 14.0933 50.7442 12.2106 51.9327C10.6575 52.9142 9.43977 54.1304 8.59394 55.545C7.24061 57.8054 7.27706 59.8646 7.29602 60.2408L7.29748 61.5869Z" fill="#888888" stroke="#888888" strokeWidth="5.83333" strokeLinejoin="round" />
                        </svg>}
                     </div>
                     <ChangeAvatarModal isOpen={isChange} setIsOpen={setIsChange}>
                        <div className="sidebar-user__change">
                           <svg width="25" height="25" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.75002 61.25C7.14585 61.25 5.77308 60.6793 4.63169 59.5379C3.4903 58.3965 2.91863 57.0228 2.91669 55.4167V20.4167C2.91669 18.8125 3.48835 17.4397 4.63169 16.2983C5.77502 15.1569 7.1478 14.5853 8.75002 14.5833H17.9375L23.3334 8.75H40.8334V14.5833H25.8854L20.5625 20.4167H8.75002V55.4167H55.4167V29.1667H61.25V55.4167C61.25 57.0208 60.6793 58.3946 59.5379 59.5379C58.3966 60.6812 57.0228 61.2519 55.4167 61.25H8.75002ZM55.4167 20.4167V14.5833H49.5834V8.75H55.4167V2.91666H61.25V8.75H67.0834V14.5833H61.25V20.4167H55.4167ZM32.0834 51.0417C35.7292 51.0417 38.8286 49.7661 41.3817 47.215C43.9347 44.6639 45.2103 41.5644 45.2084 37.9167C45.2064 34.2689 43.9309 31.1704 41.3817 28.6212C38.8325 26.0721 35.7331 24.7956 32.0834 24.7917C28.4336 24.7878 25.3352 26.0643 22.7879 28.6212C20.2407 31.1782 18.9642 34.2767 18.9584 37.9167C18.9525 41.5567 20.2291 44.6561 22.7879 47.215C25.3468 49.7739 28.4453 51.0494 32.0834 51.0417ZM32.0834 45.2083C30.0417 45.2083 28.316 44.5035 26.9063 43.0937C25.4966 41.684 24.7917 39.9583 24.7917 37.9167C24.7917 35.875 25.4966 34.1493 26.9063 32.7396C28.316 31.3299 30.0417 30.625 32.0834 30.625C34.125 30.625 35.8507 31.3299 37.2604 32.7396C38.6702 34.1493 39.375 35.875 39.375 37.9167C39.375 39.9583 38.6702 41.684 37.2604 43.0937C35.8507 44.5035 34.125 45.2083 32.0834 45.2083Z" fill="#888888" />
                           </svg>
                        </div>
                     </ChangeAvatarModal>
                  </div>
               </div>
               <div className="sidebar-user__item" >
                  <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <g clipPath="url(#clip0_3_3)">
                        <path d="M60 45C60 46.7681 59.2976 48.4638 58.0474 49.714C56.7971 50.9643 55.1014 51.6667 53.3333 51.6667H6.66667C4.89856 51.6667 3.20286 50.9643 1.95262 49.714C0.702379 48.4638 0 46.7681 0 45V15C0 13.2319 0.702379 11.5362 1.95262 10.2859C3.20286 9.03571 4.89856 8.33333 6.66667 8.33333H53.3333C55.1014 8.33333 56.7971 9.03571 58.0474 10.2859C59.2976 11.5362 60 13.2319 60 15V45Z" fill="#CCD6DD" />
                        <path d="M19.9167 29.3933L1.06167 48.2483C1.01667 48.295 1 48.3533 0.96167 48.4C1.52834 49.35 2.31834 50.1383 3.26834 50.7067C3.31667 50.6683 3.37334 50.6517 3.41834 50.6067L22.275 31.75C22.5875 31.4373 22.763 31.0132 22.7628 30.5711C22.7627 30.129 22.5869 29.705 22.2742 29.3925C21.9614 29.08 21.5374 28.9045 21.0952 28.9047C20.6531 28.9048 20.2292 29.0806 19.9167 29.3933ZM59.0383 48.4C59.0033 48.3533 58.9833 48.295 58.9383 48.25L40.085 29.3933C39.9303 29.2385 39.7465 29.1156 39.5443 29.0318C39.3421 28.9479 39.1253 28.9047 38.9064 28.9047C38.6875 28.9046 38.4707 28.9476 38.2684 29.0313C38.0662 29.115 37.8824 29.2378 37.7275 29.3925C37.5727 29.5472 37.4498 29.731 37.366 29.9332C37.2821 30.1354 37.2389 30.3522 37.2388 30.5711C37.2388 30.79 37.2818 31.0068 37.3655 31.2091C37.4492 31.4113 37.5719 31.5951 37.7267 31.75L56.5817 50.6067C56.625 50.65 56.685 50.6683 56.7317 50.7067C57.6797 50.1407 58.4723 49.348 59.0383 48.4Z" fill="#99AAB5" />
                        <path d="M53.3333 8.33333H6.66667C4.89856 8.33333 3.20286 9.03571 1.95262 10.2859C0.702379 11.5362 0 13.2319 0 15L0 16.7167L24.2133 40.8767C25.7374 42.3931 27.8 43.2444 29.95 43.2444C32.1 43.2444 34.1626 42.3931 35.6867 40.8767L60 16.6817V15C60 13.2319 59.2976 11.5362 58.0474 10.2859C56.7971 9.03571 55.1014 8.33333 53.3333 8.33333Z" fill="#99AAB5" />
                        <path d="M53.3333 8.33333H6.66665C5.41196 8.33573 4.18355 8.69303 3.12331 9.36397C2.06308 10.0349 1.21428 10.9921 0.674988 12.125L25.285 36.7367C25.9041 37.3558 26.639 37.8468 27.4479 38.1819C28.2567 38.517 29.1236 38.6894 29.9992 38.6894C30.8747 38.6894 31.7416 38.517 32.5505 38.1819C33.3593 37.8468 34.0943 37.3558 34.7133 36.7367L59.325 12.125C58.7857 10.9921 57.9369 10.0349 56.8767 9.36397C55.8164 8.69303 54.588 8.33573 53.3333 8.33333Z" fill="#E1E8ED" />
                     </g>
                     <defs>
                        <clipPath id="clip0_3_3">
                           <rect width="60" height="60" fill="white" />
                        </clipPath>
                     </defs>
                  </svg>
                  <span onClick={() => { navigate('/messages') }}>Сообщений {messagesQnt}</span>
               </div>
               <div className="sidebar-user__item" >
                  <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M35.0625 8.67563L39.2756 16.7569C39.589 17.3518 40.0389 17.8639 40.5884 18.2515C41.1378 18.639 41.7713 18.8908 42.4369 18.9863L51.3356 20.205C56.0944 20.8613 57.9394 26.7281 54.42 29.9906L48.3263 35.6138C47.8075 36.0916 47.4181 36.6929 47.1942 37.3616C46.9703 38.0304 46.9192 38.7449 47.0456 39.4388L48.5325 47.685C49.3594 52.2788 44.58 55.86 40.3856 53.76L31.8806 49.5413C31.2952 49.2545 30.6519 49.1054 30 49.1054C29.3481 49.1054 28.7048 49.2545 28.1194 49.5413L19.6144 53.76C15.4181 55.8413 10.6406 52.2788 11.4675 47.685L12.9544 39.4369C13.2169 38.0306 12.7294 36.5869 11.6756 35.6119L5.58001 29.9906C2.06063 26.7469 3.90563 20.8594 8.66438 20.2031L17.5631 18.9844C18.2307 18.8949 18.8667 18.6454 19.4171 18.2573C19.9675 17.8691 20.416 17.3537 20.7244 16.755L24.9394 8.67563C27.0844 4.60688 32.9344 4.60688 35.0606 8.67563" fill="#FCD53F" />
                  </svg>
                  <span onClick={() => { navigate('/favorites') }}>Закладки {favQnt}</span>
               </div>
               <div className="sidebar-user__item" >
                  <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path fillRule="evenodd" clipRule="evenodd" d="M33.3425 3.125H39.1575C42.145 3.125 44.5225 3.125 46.4275 3.305C48.38 3.4925 50.0325 3.88 51.5025 4.7825C53.017 5.71098 54.29 6.98491 55.2175 8.5C56.1175 9.97 56.5075 11.6225 56.6925 13.575C56.875 15.48 56.875 17.8575 56.875 20.845V22.8825C56.875 25.0075 56.875 26.7 56.78 28.0725C56.685 29.475 56.485 30.68 56.0175 31.8075C55.4524 33.1726 54.624 34.413 53.5795 35.458C52.535 36.5029 51.2949 37.3319 49.93 37.8975C48.98 38.29 47.9725 38.495 46.8275 38.6075C46.8125 38.9575 46.7958 39.2892 46.7775 39.6025C46.675 41.0925 46.4625 42.3625 45.97 43.5475C44.7648 46.4562 42.4537 48.7673 39.545 49.9725C38.0525 50.5925 36.4075 50.7725 34.3375 50.84C33.2225 50.875 32.5125 50.9 31.97 50.965C31.46 51.0275 31.2675 51.11 31.1625 51.1725C31.0475 51.24 30.8875 51.365 30.6125 51.7475C30.3125 52.16 29.9725 52.73 29.4375 53.6375L28.7875 54.7325C27.095 57.5925 22.905 57.5925 21.2125 54.7325L20.5625 53.6375C20.0275 52.73 19.6875 52.16 19.3875 51.7475C19.1125 51.365 18.9525 51.24 18.8375 51.1725C18.7325 51.11 18.54 51.0275 18.03 50.965C17.2428 50.8922 16.453 50.8505 15.6625 50.84C13.5925 50.7725 11.9475 50.59 10.455 49.9725C7.54626 48.7673 5.23521 46.4562 4.03 43.5475C3.5375 42.3625 3.325 41.0925 3.225 39.6025C3.125 38.1425 3.125 36.3425 3.125 34.07V31.905C3.125 28.715 3.125 26.185 3.3175 24.16C3.515 22.085 3.9275 20.345 4.875 18.7975C5.85378 17.1989 7.19707 15.8548 8.795 14.875C10.3425 13.925 12.0825 13.515 14.1575 13.3175C14.6825 13.2675 15.245 13.2292 15.845 13.2025C16.045 11.4025 16.445 9.8675 17.2825 8.4975C18.211 6.98303 19.4849 5.70996 21 4.7825C22.47 3.8825 24.1225 3.4925 26.075 3.3075C27.98 3.125 30.3575 3.125 33.3425 3.125ZM19.63 13.1275L21.9 13.125H28.095C31.285 13.125 33.815 13.125 35.84 13.3175C37.915 13.515 39.655 13.9275 41.2025 14.875C42.8001 15.8541 44.1434 17.1974 45.1225 18.795C46.0725 20.3425 46.4825 22.0825 46.68 24.1575C46.8725 26.1825 46.8725 28.7125 46.8725 31.9025V34.825C47.4277 34.7663 47.9726 34.6334 48.4925 34.43C49.4027 34.0531 50.2298 33.5005 50.9264 32.8039C51.623 32.1073 52.1756 31.2802 52.5525 30.37C52.7975 29.775 52.9525 29.0275 53.0375 27.815C53.1225 26.585 53.1225 25.0225 53.1225 22.8125V20.9375C53.1225 17.8325 53.1225 15.6375 52.9575 13.9275C52.7975 12.25 52.4975 11.24 52.0175 10.4575C51.3992 9.44884 50.5512 8.60075 49.5425 7.9825C48.7575 7.5 47.7475 7.2 46.0675 7.04C44.3625 6.8775 42.165 6.875 39.06 6.875H33.435C30.33 6.875 28.1325 6.875 26.425 7.04C24.7475 7.2 23.7375 7.5 22.9525 7.98C21.9438 8.59825 21.0957 9.44634 20.4775 10.455C20.0775 11.1125 19.8025 11.915 19.63 13.1275ZM14.51 17.055C12.71 17.225 11.61 17.55 10.7525 18.075C9.65919 18.745 8.73997 19.6642 8.07 20.7575C7.545 21.615 7.22 22.715 7.0475 24.515C6.8725 26.34 6.8725 28.6925 6.8725 32.0025V34.0025C6.8725 36.3575 6.8725 38.03 6.9625 39.3475C7.0525 40.6475 7.22 41.46 7.49 42.1125C7.89861 43.0986 8.49751 43.9945 9.25248 44.749C10.0074 45.5036 10.9037 46.102 11.89 46.51C12.7225 46.855 13.8 47.0275 15.78 47.09L15.8575 47.0925C16.8725 47.125 17.7525 47.155 18.4825 47.2425C19.2575 47.3375 20.02 47.5175 20.7425 47.9425C21.455 48.3675 21.97 48.925 22.4175 49.5425C22.835 50.1175 23.2625 50.84 23.75 51.66L24.4375 52.8225C24.4949 52.9189 24.5771 52.9981 24.6757 53.0518C24.7742 53.1055 24.8854 53.1316 24.9975 53.1275C25.1096 53.1316 25.2208 53.1055 25.3193 53.0518C25.4179 52.9981 25.5001 52.9189 25.5575 52.8225L26.245 51.66C26.73 50.84 27.16 50.115 27.575 49.5425C28.0134 48.8963 28.5844 48.3509 29.25 47.9425C29.975 47.5175 30.7375 47.3375 31.515 47.2425C32.3868 47.1572 33.2617 47.1071 34.1375 47.0925H34.2125C36.195 47.0275 37.27 46.855 38.1075 46.51C39.0936 46.1014 39.9895 45.5025 40.744 44.7475C41.4986 43.9926 42.097 43.0963 42.505 42.11C42.775 41.46 42.9425 40.645 43.03 39.3475C43.1225 38.03 43.1225 36.3575 43.1225 34.0025V32.0025C43.1225 28.6925 43.1225 26.3425 42.9475 24.515C42.775 22.715 42.45 21.615 41.925 20.7575C41.255 19.6642 40.3358 18.745 39.2425 18.075C38.385 17.55 37.285 17.225 35.485 17.0525C33.66 16.8775 31.3075 16.8775 27.9975 16.8775H22C18.69 16.8775 16.34 16.8775 14.5125 17.0525" fill="black" />
                     <path d="M18.75 32.5C18.75 33.163 18.4866 33.7989 18.0178 34.2678C17.5489 34.7366 16.913 35 16.25 35C15.587 35 14.9511 34.7366 14.4822 34.2678C14.0134 33.7989 13.75 33.163 13.75 32.5C13.75 31.837 14.0134 31.2011 14.4822 30.7322C14.9511 30.2634 15.587 30 16.25 30C16.913 30 17.5489 30.2634 18.0178 30.7322C18.4866 31.2011 18.75 31.837 18.75 32.5ZM27.5 32.5C27.5 33.163 27.2366 33.7989 26.7678 34.2678C26.2989 34.7366 25.663 35 25 35C24.337 35 23.7011 34.7366 23.2322 34.2678C22.7634 33.7989 22.5 33.163 22.5 32.5C22.5 31.837 22.7634 31.2011 23.2322 30.7322C23.7011 30.2634 24.337 30 25 30C25.663 30 26.2989 30.2634 26.7678 30.7322C27.2366 31.2011 27.5 31.837 27.5 32.5ZM36.25 32.5C36.25 33.163 35.9866 33.7989 35.5178 34.2678C35.0489 34.7366 34.413 35 33.75 35C33.087 35 32.4511 34.7366 31.9822 34.2678C31.5134 33.7989 31.25 33.163 31.25 32.5C31.25 31.837 31.5134 31.2011 31.9822 30.7322C32.4511 30.2634 33.087 30 33.75 30C34.413 30 35.0489 30.2634 35.5178 30.7322C35.9866 31.2011 36.25 31.837 36.25 32.5Z" fill="black" />
                  </svg>
                  <span onClick={() => { navigate('/comments') }}>Мои коментарии</span>
               </div>
               <div className="btn btn-info sidebar-user__button" onClick={logout}>Выйти</div>
            </div> :
            <div className="sidebar__user">
               <p>Вы не авторизованы на <br />сайте, доступ к архиву <br />закрыт. </p>
               <p>
                  <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 512 512">
                     <path fill="#018303" d="M320 96L192 96 144.6 24.9C137.5 14.2 145.1 0 157.9 0L354.1 0c12.8 0 20.4 14.2 13.3 24.9L320 96zM192 128l128 0c3.8 2.5 8.1 5.3 13 8.4C389.7 172.7 512 250.9 512 416c0 53-43 96-96 96L96 512c-53 0-96-43-96-96C0 250.9 122.3 172.7 179 136.4c4.8-3.1 9.2-5.9 13-8.4z"></path>
                  </svg>
                  <a style={{ color: "#f47a6d" }} href="#" onClick={() => { setIsOpenLogin(true) }}>Проверь аккаунт</a>
               </p>
               <LoginModal isOpen={isOpenLogin} setIsOpen={setIsOpenLogin}><button className="btn btn-info">Вход</button></LoginModal>
            </div>
         }

         <br />
         <SidebarCities setUserCheck={setUserCheck} />

         <br />
         <SidebarItems />

         <div>
            <p>
               Все вопросы, проблемные платежи, удаление аккаунтов, предложения по сайту задавайте в Telegram:
            </p>
            <form style={{ margin: 0 }} action="https://t.me/sergio_karin" target="_blank">
               <button type="submit" className="btn btn-info">Написать</button>
            </form>
         </div>
      </div>
   );
};

export default Sidebar;
