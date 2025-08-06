import axios from "axios";
import { useEffect, useState } from "react"
import ICaptcha from "../../types/ICaptcha";
import RecoveryModal from "../UX/modals/RecoveryModal";
import validatePassword from "../../utils/validatePassword";

const RecoveryContent = () => {
   const [login, setLogin] = useState<string>('')
   const [password, setPassword] = useState<string>('')
   const [code, setCode] = useState<string>('')
   const [captcha, setCaptcha] = useState<ICaptcha>({
      data: '',
      text: ''
   });
   const [message, setMessage] = useState<string>("");
   const [isOpen, setIsOpen] = useState<boolean>(false)
   const [randomNum, setRandomNum] = useState<number>(0)
   const apiUrlSend: string = 'https://check-you.blog/api/send-code'
   const [error, setError] = useState<string>('')
   const [timer, setTimer] = useState<number>(0)

   useEffect(() => {
      fetchCaptcha();
   }, []);

   function getRandomNumber(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   const sendCode = async () => {
      if (timer === 0) { // Разрешаем отправку, только если таймер на нуле
         const num: number = getRandomNumber(100001, 999999); // Генерация нового кода
         setRandomNum(num);
         setTimer(60); // Перезапускаем таймер

         try {
            setError("");

            await axios.post(apiUrlSend, {
               code: num,
               login,
            });

         } catch (error) {
            setError("Что-то пошло не так, попробуйте ещё раз!");
         }
      }
   };

   const fetchCaptcha = async () => {
      const response = await axios.get("https://check-you.blog/api/captcha");
      setCaptcha(response.data);
   };

   const sendFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();


      const validateMessage = validatePassword(password)
      if (validateMessage) return setMessage(validateMessage);
      if (code !== captcha.text) return setMessage("Капча введена неправильно!")

      setIsOpen(true)

      sendCode()
   };

   return (
      <div className="">
         <RecoveryModal isOpen={isOpen} setIsOpen={setIsOpen} login={login} password={password} randomNum={randomNum} error={error} setError={setError} sendCode={sendCode} timer={timer} setTimer={setTimer}> </RecoveryModal>
         <form className="form__content" onSubmit={sendFormHandler}>
            <label htmlFor="login">Ваш логин на сайте</label>
            <div>
               <input type="text" className="form__input" placeholder="Логин" id="login" name="login" value={login} onChange={(e) => { setLogin(e.target.value) }} required />
            </div>
            <label htmlFor="password">Ваш новый пароль</label>
            <div>
               <input type="password" className="form__input" placeholder="Новый пароль" id="password" name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} required />
            </div>
            <div dangerouslySetInnerHTML={{ __html: captcha.data }} className="form__capcha" />
            <div className="form__row">
               <input type="text" className="form__input" placeholder="Код с картинки" id="code" name="code" onChange={(e) => { setCode(e.target.value) }} required />
               <button type="button" className="btn btn-info form__button" onClick={fetchCaptcha} style={{ margin: 0 }}>Обновить капчу</button></div>
            <div>
            </div>
            {message && <p style={{ color: "red", margin: '0' }}>{message}</p>}
            <button type="submit" className="btn btn-info form__button form__submit">Отправить</button>
         </form>
      </div>
   )
}

export default RecoveryContent