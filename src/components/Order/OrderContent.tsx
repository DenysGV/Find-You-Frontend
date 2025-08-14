import { useEffect, useState } from "react"
import Title from "../UX/Title"
import axios from "axios"
import IUser from "../../types/IUser";
import { IOrderState } from "../../types/IOrder";
import fetchData from "../../services/fetchData";
import OrderContentItem from "./OrderContentItem";
import ICaptcha from "../../types/ICaptcha";

const OrderContent = () => {
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const [message, setMessage] = useState<string>('')
   const [seccess, setSeccess] = useState<boolean>(false)
   const [error, setError] = useState<string>('')
   const [result, setResult] = useState<IOrderState>({
      items: null,
      loading: false,
      error: false,
   })
   const apiUrlAdd: string = 'http://62.169.27.192/api/add-order'
   const apiUrlGet: string = `http://62.169.27.192/api/get-orders?user_id=${user?.id}&type=add`

   const [code, setCode] = useState<string>("");
   const [captcha, setCaptcha] = useState<ICaptcha>({
      data: '',
      text: ''
   });

   const fetchCaptcha = async () => {
      const response = await axios.get("http://62.169.27.192/api/captcha");
      setCaptcha(response.data);
   };

   const sendFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError('')

      if (code !== captcha.text) return setError("Капча введена неправильно!")

      try {
         if (!message.trim()) {
            setError('Необходимо заполнить текстовое поле!')
         }

         const result = await axios.post(apiUrlAdd, {
            user_id: user?.id,
            text: message,
            type: 'add',
         })

         setResult(prev => ({
            ...prev,
            items: prev.items && [...prev.items, result.data]
         }))
         setSeccess(true)
      } catch (error: any) {
         setError('Что-то пошло не так, попробуйте ещё раз!')
      }
   }

   const getOrders = async () => {
      await fetchData('get', apiUrlGet, setResult)
   }

   useEffect(() => {
      getOrders()
   }, [])

   useEffect(() => { fetchCaptcha(); }, []);

   return (
      <div className="order__container layout-container">
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         <p>Мы обработаем вашу заявку в течении 24 часов</p>
         {seccess && <p style={{ color: 'green' }}>Вы успешно отправили заявку</p>}
         {error && <p style={{ color: 'red' }}>{error}</p>}
         <form className="order__row" onSubmit={sendFormHandler}>
            <div className="layout-row">
               <textarea rows={4} name="order" id="order" placeholder="Сообщение" onChange={(e) => { setMessage(e.target.value) }} required></textarea>
            </div>
            <div>
               <div dangerouslySetInnerHTML={{ __html: captcha.data }} className="form__capcha" />
               <div className="form__row">
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="form__input" placeholder="Код с картинки" />
                  <button type="button" className="btn btn-info form__button" onClick={fetchCaptcha}>Обновить капчу</button>
               </div>
            </div>
            <div className="order__submit">
               <button type="submit" className="btn btn-info">Отправить</button>
            </div>
         </form>
         <Title classes='pt'>Заявки</Title>
         <div className="order__items">
            {result.error && <p style={{ color: 'red' }}>Что-то пошло не так, попробуйте ещё раз!</p>}
            {result.items && result.items.map(item => (
               <OrderContentItem {...item} key={item.id} />
            ))}
         </div>
      </div>
   )
}

export default OrderContent