// AccountContent.tsx

import { useEffect, useState } from "react";
import AccountComments from "./AccountComments";
import AccountEditor from "./AccountEditor"; // Make sure AccountEditorProps is imported/used by AccountEditor
import AccountGallery from "./AccountGallery";
import AccountHeader from "./AccountHeader";
import AccountInfo from "./AccountInfo";
import AccountSimilars from "./AccountSimilars";
import { useNavigate, useParams } from "react-router-dom";
import fetchData from "../../services/fetchData";
import { IAccountState, IAccountReplyComment } from "../../types/IAccounts"; // Ensure IAccountReplyComment is defined
import IUser from "../../types/IUser";
import LoginModal from "../UX/modals/LoginModal";

const AccountContent = () => {
   const { accountId } = useParams<{ accountId: string }>();
   const api = `https://check-you.blog/api/account?id=${Number(accountId)}`;
   const [result, setResult] = useState<IAccountState>({
      items: null,
      loading: false,
      error: false,
   });
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const [replyComment, setReplyComment] = useState<IAccountReplyComment | null>(null);
   const [editComment, setEditComment] = useState<IAccountReplyComment | null>(null);
   const navigate = useNavigate();
   const [isOpenLogin, setIsOpenLogin] = useState<boolean>(false);

   useEffect(() => {
      fetchData('get', api, setResult);
   }, [accountId]); // api will change if accountId changes, so this is fine.

   const handleAction = (comment: IAccountReplyComment, action: string) => {
      if (action === 'reply') {
         setReplyComment(comment);
         setEditComment(null);
      } else { // Assuming 'edit'
         setEditComment(comment);
         setReplyComment(null);
      }
   };

   // This specific handler will be passed to AccountEditor
   const handleEditorCancel = () => {
      setReplyComment(null); // Cancel reply mode
      setEditComment(null);  // Cancel edit mode
   };

   const navigateHandler = (to: string) => {
      navigate(`/${to}`);
   };

   return (
      <>
         {result.loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         {(user?.role === 'user' || !user?.role) ? <div className="account-warning">
            <div className="account-warning__text fav__warning">
               <h5>Доступ ограничен</h5>
               <p>Для просмотра вам необходимо пройти процедуру регистрации и оплатить доступ или если вы это уже сделали авторизуйтесь на сайте</p>
            </div>
            {!user?.role && <div className="account-warning__buttons">
               <button className="btn-info" onClick={() => { navigateHandler('registration') }}>Регистрация</button>
               <LoginModal isOpen={isOpenLogin} setIsOpen={setIsOpenLogin}><button className="btn btn-info">Вход</button></LoginModal>
               <button className="btn-info" onClick={() => { navigateHandler('recovery') }}>Забыли пароль?</button>
            </div>}
         </div> :
            result.items && (
               <>
                  <AccountHeader {...result.items} />
                  <AccountInfo {...result.items} />
                  <AccountGallery {...result.items} />
                  <AccountEditor
                     {...result.items} // Ensure AccountEditorProps includes types for these spread props
                     replyComment={replyComment}
                     // setReplyComment={setReplyComment} // AccountEditor probably shouldn't directly set parent's state for this; it should signal via other means or props if needed
                     cancelAction={handleEditorCancel} // Pass the new handler
                     accountId={Number(accountId)}
                     editComment={editComment}
                     setResult={setResult}
                  />
                  <AccountComments
                     comments={result.items.comments || []}
                     onAction={handleAction} // This is for AccountComments to signal AccountContent
                     setResult={setResult}
                     accountId={Number(accountId)}
                  />
                  <AccountSimilars {...result.items} />
               </>
            )}
      </>
   );
};

export default AccountContent;