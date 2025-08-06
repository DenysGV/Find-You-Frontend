import { useEffect, useState } from "react";
import { IModalRecovery } from "../../../types/IModal";
import axios from "axios";

const RecoveryModal = ({ isOpen, setIsOpen, children, login, password, randomNum, error, setError, sendCode, timer, setTimer }: IModalRecovery) => {
   const apiUrlChange: string = 'http://localhost:5000/recovery-password'
   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);
   const [code, setCode] = useState<number>(0)
   const [seccess, setSeccess] = useState<boolean>(false)

   const changePassword = async () => {
      if (login && password && code == randomNum) {
         try {
            setError('')

            await axios.post(apiUrlChange, {
               login,
               newPassword: password
            })

            setSeccess(true)
         } catch (error) {
            setError('Что-то пошло не так, попробуйте ещё раз!')
         }
      } else {
         setError('Коды не совпадают')
      }
   }

   useEffect(() => {
      const interval = setInterval(() => {
         setTimer((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
   }, []);



   return (
      <>
         <div onClick={openModal}>{children}</div>
         {isOpen && (
            <div id="loginModal" className="modal">
               <div className="modal-content">
                  <div className="modal-header">
                     ПОДТВЕРЖДЕНИЕ
                     <span className="close-btn" onClick={closeModal}>&times;</span>
                  </div>
                  <div className="modal-recovery">
                     <p>Мы отправили вам код подтверждения на вашу почту</p>
                     {error && <p style={{ color: 'red' }}>{error}</p>}
                     {seccess && <p style={{ color: 'green' }}>Вы успешно сменили пароль !</p>}
                     <div className="modal-recovery__row">
                        <input placeholder="Код" type="text" name="code" value={code} onChange={(e) => { setCode(Number(e.target.value)) }} />
                        <button className="btn" onClick={() => { sendCode() }} disabled={timer > 0}>
                           {timer > 0 ? `Получить новый (${timer})` : "Получить новый"}
                        </button>
                     </div>
                     <div className="modal-recovery__submit">
                        <button className="btn btn-info" onClick={changePassword}>Подтвердить</button>
                     </div>
                     <p>Если код не пришел, проверьте папку "Спам" или запросите новый</p>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}

export default RecoveryModal