import { useEffect, useState } from "react";
import SendMessageModal from "../UX/modals/SendMessageModal";
import fetchData from "../../services/fetchData";
import { IMessageState } from "../../types/IMessage";
import IUser from "../../types/IUser";
import MessagesContentItem from "./MessagesContentItem";
import axios from "axios";

const MessagesContent = () => {
   const [isOpenSend, setIsOpenSend] = useState<boolean>(false);
   const storedUser = localStorage.getItem('user');
   let user: IUser = storedUser ? JSON.parse(storedUser) : null;
   const apiUrl = `http://localhost:5000/get-messages?user_id=${user?.id}`
   const apiUrlDelete = `http://localhost:5000/delete-messages`
   const [result, setResult] = useState<IMessageState>({
      items: null,
      error: false,
      loading: false,
   })
   const [filter, setFilter] = useState<string>('')
   const [selected, setSelected] = useState<number[]>([])
   const [seccess, setSeccess] = useState<string>('')
   const [error, setError] = useState<string>('')

   const selectFilterHandler = (filterName: string): void => {
      setFilter(filterName)
      setSelected([])
   }

   const deleteHandler = async () => {
      try {
         setError('')
         setSeccess('')

         await axios.delete(apiUrlDelete, {
            data: {
               user_id: user.id,
               message_ids: selected,
            }
         })

         selected.forEach(item => {
            setResult(prev => {
               if (prev.items) {
                  return {
                     ...prev,
                     items: [...prev.items.filter(prevItem => prevItem.id != item)]
                  }
               } else {
                  return prev
               }
            })
         })

         setSeccess('Сообщения успешно удалены')
      } catch (error) {
         setError('Что-то пошло не так, попробуйте ещё раз!')
      }

   }

   const selectAllMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
         let idsArr: number[] = []
         result.items?.forEach(item => idsArr.push(item.id))
         setSelected(idsArr)
      } else {
         setSelected([])
      }
   }

   useEffect(() => {
      fetchData('get', apiUrl, setResult)
   }, [])

   return (
      <>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {seccess && <p style={{ color: 'green' }}>{seccess}</p>}
         <div className="messages__actions">
            <div className="messages__buttons">
               <div className="btn messages__button" onClick={() => { selectFilterHandler('incoming') }}>Входящие сообщения</div>
               <div className="btn messages__button" onClick={() => { selectFilterHandler('sent') }}>Отправленные сообщения</div>
               <SendMessageModal setResult={setResult} isOpen={isOpenSend} setIsOpen={setIsOpenSend}>
                  <div className="btn messages__button">Отправить сообщения</div>
               </SendMessageModal>
            </div>
            {selected.length > 0 && <svg onClick={deleteHandler} width="30" height="30" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
            </svg>}
         </div>

         <hr />

         <div className="messages-table">
            <div className="messages-table-item messages-table__preview">
               <div className="messages-table-item__title"><p>Тема сообщения</p></div>
               <div className="messages-table-item__author"><p>Отправитель</p></div>
               <div className="messages-table-item__date"><p>Дата</p></div>
               <div className="messages-table-item__checkbox"><input type="checkbox" onChange={selectAllMessages} /></div>
            </div>
            {result.error && <p style={{ color: 'red' }}>Что-то пошло не так, попробуйте ещё раз!</p>}
            {result.items && result.items.filter(item => {
               if (!filter) return item

               if (item.sender == user.login && filter == 'sent') {
                  return item
               } else if (item.sender != user.login && filter == 'incoming') {
                  return item
               }
            }).map(item => (
               <MessagesContentItem {...item} selected={selected} setSelected={setSelected} key={item.id} />
            ))}
         </div>
      </>
   )
}

export default MessagesContent