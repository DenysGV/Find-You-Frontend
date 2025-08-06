import axios from "axios";
import { useEffect, useState } from "react";
import fetchData from "../../services/fetchData";
import ICaptcha from "../../types/ICaptcha";
import validatePassword from "../../utils/validatePassword";
import RegistrationSuccessModal from "../UX/modals/RegistrationSuccessModal";

const RegistrationContent = () => {
   const [login, setLogin] = useState<string>("");
   const [password, setPassword] = useState<string>("");
   const [repeatPassword, setRepeatPassword] = useState<string>("");
   const [email, setEmail] = useState<string>("");
   const [code, setCode] = useState<string>("");
   const [isOpen, setIsOpen] = useState<boolean>(false)
   const [captcha, setCaptcha] = useState<ICaptcha>({
      data: '',
      text: ''
   });
   const [loginAvailable, setLoginAvailable] = useState({
      items: ' ',
      error: false,
      loading: false,
   });;
   const [message, setMessage] = useState("");
   const [seccessful, setSeccessful] = useState<boolean>();

   useEffect(() => { fetchCaptcha(); }, []);

   const fetchCaptcha = async () => {
      const response = await axios.get("http://localhost:5000/captcha");
      setCaptcha(response.data);
   };

   const checkLogin = async () => {
      fetchData('get', `http://localhost:5000/check-login/${login}`, setLoginAvailable)
   };

   const sendFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setMessage('')

      if (password !== repeatPassword) return setMessage("Пароли не совпадают!");
      const validateMessage = validatePassword(password)
      if (validateMessage) return setMessage(validateMessage);
      if (code !== captcha.text) return setMessage("Капча введена неправильно!")

      try {
         await axios.post("http://localhost:5000/register", { login, password, email, code });

         const responseLogin = await axios.post('http://localhost:5000/login', {
            login,
            password
         });

         setIsOpen(true)
         localStorage.setItem('token', responseLogin.data.token);
         localStorage.setItem('user', JSON.stringify(responseLogin.data.user));
         setSeccessful(true);
      } catch (error: any) {
         setMessage(error.response.data.message || 'Что-то пошло не так');
      }
   };

   return (
      <div className="row-fluid mb indexcontent">
         <p>Здравствуйте, уважаемый посетитель нашего сайта! Регистрация на нашем сайте позволит Вам быть его полноценным участником. А также позволит просматривать материалы</p>
         <hr />
         <form onSubmit={sendFormHandler} className="form__content">
            {message && <p style={{ color: "red", margin: '0' }}>{message}</p>}
            {seccessful && <p style={{ color: "green", margin: '0' }}>Регистрация успешна!</p>}
            <div>
               {loginAvailable.loading && <div className="loader">
                  <div className="loader__circle"></div>
               </div>}
               <label>Логин</label>
               <div className="form__row">
                  <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required className="form__input" placeholder="Логин" />
                  <button type="button" onClick={checkLogin} className="btn btn-info form__button" >Проверить имя</button>
               </div>
               {loginAvailable.error && <p style={{ color: "red", margin: '0' }}>Не удалась проврка, попробуйте ещё раз!</p>}
               {!loginAvailable.items && <p style={{ color: "red", margin: '0' }}>Логин занят!</p>}
               {loginAvailable.items && loginAvailable.items != ' ' && <p style={{ color: "green" }}>Логин свободен!</p>}
            </div>
            <label>Пароль</label>
            <div>
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form__input" placeholder="Пароль" />
            </div>

            <label>Повторный пароль</label>
            <div>
               <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required className="form__input" placeholder="Повторный пароль" />
            </div>

            <label>Email</label>
            <div>
               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form__input" placeholder="Email" />
            </div>

            <div dangerouslySetInnerHTML={{ __html: captcha.data }} className="form__capcha" />
            <div className="form__row">
               <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="form__input" placeholder="Код с картинки" />
               <button type="button" className="btn btn-info form__button" onClick={fetchCaptcha}>Обновить капчу</button>
            </div>

            <div>
               <RegistrationSuccessModal isOpen={isOpen} setIsOpen={setIsOpen}>
                  <button type="submit" className="btn btn-info form__button form__submit" >Отправить</button>
               </RegistrationSuccessModal>
            </div>
         </form>
      </div>
   );
};

export default RegistrationContent;