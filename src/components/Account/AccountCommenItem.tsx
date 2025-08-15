import { useState } from "react";
import { ICommentProps, IAccountState, IComment } from "../../types/IAccounts"; // Убедитесь, что ICommentProps включает accountId
import IUser from "../../types/IUser";
import axios from "axios";
import { convertUtcToLocal } from "../../utils/DateUtils";
import AccountEditor from "./AccountEditor"; // Убедитесь, что путь правильный

const AccountCommenItem = ({ id, user_id, text, date_comment, time_comment, author_nickname, children, setResult, accountId, onAction }: ICommentProps) => {
   const [dropdownEdit, setDropdownEdit] = useState<boolean>(false);
   const [dropdownReport, setDropdownReport] = useState<boolean>(false);
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const apiUrlRemove: string = 'http://localhost:5000/delete-comment';
   const apiUrlAddReport: string = 'http://localhost:5000/add-reports'; // Переименовал для ясности
   const [reportErrorMessage, setReportErrorMessage] = useState<boolean>(false);
   const [removeErrorMessage, setRemoveErrorMessage] = useState<boolean>(false);
   const [reportSuccessMessage, setReportSuccessMessage] = useState<boolean>(false);

   const [editorMode, setEditorMode] = useState<null | 'reply' | 'edit'>(null);

   // Format the date and time from UTC to local time
   const formattedDateTime = convertUtcToLocal(date_comment, time_comment);

   const removeComment = async (commentId: number) => {
      try {
         await axios.delete(apiUrlRemove, {
            data: { comment_id: commentId }
         });

         const removeNestedComment = (comments: IComment[]): IComment[] => {
            return comments
               .filter(comment => comment.id !== commentId)
               .map(comment => ({
                  ...comment,
                  children: comment.children ? removeNestedComment(comment.children) : []
               }));
         };

         setResult((prev: IAccountState) => ({
            ...prev,
            items: prev.items ? {
               ...prev.items,
               comments: prev.items.comments ? removeNestedComment(prev.items.comments) : []
            } : null // или prev.items если он может быть null/undefined
         }));
      } catch (error) {
         setRemoveErrorMessage(true);
         setTimeout(() => setRemoveErrorMessage(false), 3000);
      }
   };

   const reportComment = async (commentId: number, reportedUserId: number, reportText: string) => {
      setReportErrorMessage(false);
      setReportSuccessMessage(false);

      try {
         await axios.post(apiUrlAddReport, {
            comment_id: commentId,
            reported_user_id: reportedUserId,
            reporter_user_id: user?.id,
            text: reportText,
         });
         setReportSuccessMessage(true);
         setTimeout(() => setReportSuccessMessage(false), 3000);
      } catch (error: any) {
         if (error.response && error.response.status === 409) {
            setReportErrorMessage(true);
            setTimeout(() => setReportErrorMessage(false), 3000);
         } else {
            // Общая ошибка для других статусов
            console.error("Report error:", error);
            setReportErrorMessage(true); // Можно сделать более общее сообщение
            setTimeout(() => setReportErrorMessage(false), 3000);
         }
      }
   };

   const handleActionDropdown = (action: string) => {
      switch (action) {
         case 'Спам':
            reportComment(id, user_id, 'Спам');
            break;
         case 'Оскорбление':
            reportComment(id, user_id, 'Оскорбление');
            break;
         case 'Удалить':
            removeComment(id);
            break;
         default:
            break;
      }
      setDropdownEdit(false);
      setDropdownReport(false);
   };

   const handleToggleEditor = (mode: 'reply' | 'edit') => {
      if (editorMode === mode) {
         setEditorMode(null); // Закрыть, если уже открыто в этом режиме
      } else {
         setEditorMode(mode);
      }
      setDropdownEdit(false); // Закрыть дропдаун в любом случае
   };

   const handleCancelEditor = () => {
      setEditorMode(null);
   };


   return (
      <>
         <div className="comment__item" >
            <div>
               {removeErrorMessage && <p style={{ color: 'red' }}>Ошибка удаления. Попробуйте снова.</p>}
               {reportErrorMessage && <p style={{ color: 'red' }}>Вы уже отправили жалобу или произошла ошибка.</p>}
               {reportSuccessMessage && <p style={{ color: 'green' }}>Жалоба отправлена.</p>}

               <strong>{author_nickname}</strong>
               <div className="comment-content" dangerouslySetInnerHTML={{ __html: text }}></div>
               <p>{formattedDateTime} <span
                  style={{
                     color: "#e36f6f",
                     display: "inline-block",
                     cursor: "pointer",
                     marginLeft: "10px"
                  }}
                  onClick={() => handleToggleEditor('reply')}
               >
                  Цитата❞
               </span></p>
            </div>
            <div>
               {user && user.id === user_id ? (
                  <div className="dropdown">
                     <div onClick={() => { setDropdownEdit(prev => !prev); setDropdownReport(false); }}>
                        {dropdownEdit ?
                           <svg style={{ margin: '3px 3px 0 auto', cursor: 'pointer' }} width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.8884 30.0033L56.28 9.61333C57.039 8.82749 57.459 7.77498 57.4495 6.6825C57.44 5.59001 57.0018 4.54496 56.2293 3.77242C55.4567 2.99989 54.4117 2.56169 53.3192 2.55219C52.2267 2.5427 51.1742 2.96268 50.3884 3.72167L29.9967 24.1117L9.60669 3.72167C8.82533 2.94054 7.76571 2.50172 6.66086 2.50172C5.55601 2.50172 4.49639 2.94054 3.71502 3.72167C2.9339 4.50303 2.49508 5.56265 2.49508 6.6675C2.49508 7.77235 2.9339 8.83197 3.71502 9.61333L24.105 30.0033L3.66836 50.4417C3.08442 51.0239 2.68651 51.7663 2.52508 52.5749C2.36366 53.3836 2.44598 54.2219 2.76161 54.9837C3.07725 55.7454 3.61198 56.3963 4.298 56.8538C4.98403 57.3113 5.79045 57.5548 6.61502 57.5533C7.68169 57.5533 8.74836 57.1467 9.56169 56.3333L29.9984 35.895L50.3884 56.285C50.7753 56.6719 51.2348 56.9788 51.7403 57.1881C52.2459 57.3974 52.7878 57.5051 53.335 57.505C54.1589 57.5048 54.9642 57.2604 55.6492 56.8027C56.3342 56.3449 56.8681 55.6944 57.1835 54.9333C57.4988 54.1722 57.5815 53.3346 57.421 52.5266C57.2604 51.7185 56.864 50.9761 56.2817 50.3933L35.8884 30.0033Z" fill="#E36F6F" /></svg>
                           : <svg style={{ margin: '0 0 0 auto', cursor: 'pointer' }} width="25" height="25" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M35.52 12.075C36.6533 12.425 37.7367 12.875 38.77 13.425L43.3525 10.675C43.8303 10.3884 44.3902 10.2696 44.9432 10.3376C45.4963 10.4055 46.0107 10.6563 46.405 11.05L48.95 13.595C49.3437 13.9893 49.5945 14.5037 49.6624 15.0568C49.7303 15.6098 49.6116 16.1697 49.325 16.6475L46.575 21.23C47.125 22.2633 47.575 23.3467 47.925 24.48L53.1075 25.7775C53.6481 25.9129 54.128 26.2251 54.4709 26.6645C54.8137 27.1038 55 27.6452 55 28.2025V31.7975C55 32.3548 54.8137 32.8962 54.4709 33.3355C54.128 33.7749 53.6481 34.0871 53.1075 34.2225L47.925 35.52C47.575 36.6533 47.125 37.7367 46.575 38.77L49.325 43.3525C49.6116 43.8303 49.7303 44.3902 49.6624 44.9432C49.5945 45.4963 49.3437 46.0107 48.95 46.405L46.405 48.95C46.0107 49.3437 45.4963 49.5945 44.9432 49.6624C44.3902 49.7303 43.8303 49.6116 43.3525 49.325L38.77 46.575C37.7367 47.125 36.6533 47.575 35.52 47.925L34.2225 53.1075C34.0871 53.6481 33.7749 54.128 33.3355 54.4709C32.8962 54.8137 32.3548 55 31.7975 55H28.2025C27.6452 55 27.1038 54.8137 26.6645 54.4709C26.2251 54.128 25.9129 53.6481 25.7775 53.1075L24.48 47.925C23.3567 47.5779 22.2686 47.1259 21.23 46.575L16.6475 49.325C16.1697 49.6116 15.6098 49.7303 15.0568 49.6624C14.5037 49.5945 13.9893 49.3437 13.595 48.95L11.05 46.405C10.6563 46.0107 10.4055 45.4963 10.3376 44.9432C10.2696 44.3902 10.3884 43.8303 10.675 43.3525L13.425 38.77C12.8741 37.7314 12.4221 36.6433 12.075 35.52L6.8925 34.2225C6.3523 34.0872 5.87275 33.7754 5.52991 33.3365C5.18707 32.8977 5.00057 32.3569 5 31.8V28.205C5.00001 27.6477 5.18626 27.1063 5.52914 26.667C5.87202 26.2276 6.35188 25.9154 6.8925 25.78L12.075 24.4825C12.425 23.3492 12.875 22.2658 13.425 21.2325L10.675 16.65C10.3884 16.1722 10.2696 15.6123 10.3376 15.0593C10.4055 14.5062 10.6563 13.9918 11.05 13.5975L13.595 11.05C13.9893 10.6563 14.5037 10.4055 15.0568 10.3376C15.6098 10.2696 16.1697 10.3884 16.6475 10.675L21.23 13.425C22.2633 12.875 23.3467 12.425 24.48 12.075L25.7775 6.8925C25.9128 6.3523 26.2246 5.87275 26.6635 5.52991C27.1023 5.18707 27.6431 5.00057 28.2 5H31.795C32.3523 5.00001 32.8937 5.18626 33.333 5.52914C33.7724 5.87202 34.0846 6.35188 34.22 6.8925L35.52 12.075ZM30 40C32.6522 40 35.1957 38.9464 37.0711 37.0711C38.9464 35.1957 40 32.6522 40 30C40 27.3478 38.9464 24.8043 37.0711 22.9289C35.1957 21.0536 32.6522 20 30 20C27.3478 20 24.8043 21.0536 22.9289 22.9289C21.0536 24.8043 20 27.3478 20 30C20 32.6522 21.0536 35.1957 22.9289 37.0711C24.8043 38.9464 27.3478 40 30 40Z" fill="#E36F6F" /></svg>
                        }
                     </div>
                     {dropdownEdit && (
                        <div className="dropdown-menu-custom"> {/* Добавьте класс для стилизации если нужно */}
                           <p onClick={() => handleToggleEditor('edit')}>Изменить <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 47.5H16.0625L40.5 23.0625L36.9375 19.5L12.5 43.9375V47.5ZM7.5 52.5V41.875L40.5 8.9375C41 8.47917 41.5525 8.125 42.1575 7.875C42.7625 7.625 43.3975 7.5 44.0625 7.5C44.7275 7.5 45.3733 7.625 46 7.875C46.6267 8.125 47.1683 8.5 47.625 9L51.0625 12.5C51.5625 12.9583 51.9275 13.5 52.1575 14.125C52.3875 14.75 52.5017 15.375 52.5 16C52.5 16.6667 52.3858 17.3025 52.1575 17.9075C51.9292 18.5125 51.5642 19.0642 51.0625 19.5625L18.125 52.5H7.5ZM38.6875 21.3125L36.9375 19.5L40.5 23.0625L38.6875 21.3125Z" fill="#E36F6F" /></svg></p>
                           <p onClick={() => handleActionDropdown('Удалить')}>Удалить <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 47.5C15 48.8261 15.5268 50.0979 16.4645 51.0355C17.4021 51.9732 18.6739 52.5 20 52.5H40C41.3261 52.5 42.5979 51.9732 43.5355 51.0355C44.4732 50.0979 45 48.8261 45 47.5V17.5H15V47.5ZM20 22.5H40V47.5H20V22.5ZM38.75 10L36.25 7.5H23.75L21.25 10H12.5V15H47.5V10H38.75Z" fill="#E36F6F" /></svg></p>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="dropdown">
                     <div onClick={() => { setDropdownReport(prev => !prev); setDropdownEdit(false); }}>
                        {dropdownReport ?
                           <svg style={{ margin: '3px 3px 0 auto', cursor: 'pointer' }} width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.8884 30.0033L56.28 9.61333C57.039 8.82749 57.459 7.77498 57.4495 6.6825C57.44 5.59001 57.0018 4.54496 56.2293 3.77242C55.4567 2.99989 54.4117 2.56169 53.3192 2.55219C52.2267 2.5427 51.1742 2.96268 50.3884 3.72167L29.9967 24.1117L9.60669 3.72167C8.82533 2.94054 7.76571 2.50172 6.66086 2.50172C5.55601 2.50172 4.49639 2.94054 3.71502 3.72167C2.9339 4.50303 2.49508 5.56265 2.49508 6.6675C2.49508 7.77235 2.9339 8.83197 3.71502 9.61333L24.105 30.0033L3.66836 50.4417C3.08442 51.0239 2.68651 51.7663 2.52508 52.5749C2.36366 53.3836 2.44598 54.2219 2.76161 54.9837C3.07725 55.7454 3.61198 56.3963 4.298 56.8538C4.98403 57.3113 5.79045 57.5548 6.61502 57.5533C7.68169 57.5533 8.74836 57.1467 9.56169 56.3333L29.9984 35.895L50.3884 56.285C50.7753 56.6719 51.2348 56.9788 51.7403 57.1881C52.2459 57.3974 52.7878 57.5051 53.335 57.505C54.1589 57.5048 54.9642 57.2604 55.6492 56.8027C56.3342 56.3449 56.8681 55.6944 57.1835 54.9333C57.4988 54.1722 57.5815 53.3346 57.421 52.5266C57.2604 51.7185 56.864 50.9761 56.2817 50.3933L35.8884 30.0033Z" fill="#E36F6F" /></svg>
                           : <svg style={{ margin: '0 0 0 auto', cursor: 'pointer' }} width="25" height="25" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 35C14.8366 32.7097 17.9781 31.4268 21.25 31.4268C24.5219 31.4268 27.6634 32.7097 30 35C32.3366 37.2903 35.4781 38.5732 38.75 38.5732C42.0219 38.5732 45.1634 37.2903 47.5 35V12.5C45.1634 14.7903 42.0219 16.0732 38.75 16.0732C35.4781 16.0732 32.3366 14.7903 30 12.5C27.6634 10.2097 24.5219 8.92679 21.25 8.92679C17.9781 8.92679 14.8366 10.2097 12.5 12.5V35ZM12.5 35V52.5" stroke="#E36F6F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        }
                     </div>
                     {dropdownReport && (
                        <div className="dropdown-menu-custom">  {/* Добавьте класс для стилизации если нужно */}
                           <p onClick={() => handleActionDropdown('Оскорбление')}>Оскорбление <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 42.5C21.1643 40.9475 22.6741 39.6875 24.4098 38.8197C26.1455 37.9518 28.0594 37.5 30 37.5C34.09 37.5 37.72 39.465 40 42.5M17.5 22.525C17.5 22.525 21.025 22.2075 22.99 23.77M22.99 23.77L22.3325 25.8575C22.0725 26.68 22.75 27.5 23.69 27.5C24.68 27.5 25.3325 26.6075 24.8225 25.8375C24.3217 25.0581 23.7036 24.3607 22.99 23.77ZM42.5 22.5275C42.5 22.5275 38.975 22.2075 37.01 23.77M37.01 23.77L37.6675 25.8575C37.9275 26.68 37.25 27.5 36.31 27.5C35.32 27.5 34.6675 26.6075 35.1775 25.8375C35.6783 25.0581 36.2964 24.3607 37.01 23.77Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" /></svg></p>
                           <p onClick={() => handleActionDropdown('Спам')}>Спам <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M29.98 40H30.0025M29.98 32.5V20M30.775 7.5H29.225C23.135 7.5 20.09 7.5 17.6 8.8825C15.1075 10.2625 13.63 12.77 10.6725 17.7875L9.1975 20.2875C6.4 25.035 5 27.4075 5 30C5 32.5925 6.4 34.965 9.2 39.7125L10.6725 42.2125C13.63 47.23 15.1075 49.7375 17.5975 51.12C20.09 52.5 23.135 52.5 29.2225 52.5H30.7775C36.865 52.5 39.91 52.5 42.4025 51.12C44.8925 49.7375 46.37 47.23 49.3275 42.2125L50.8025 39.7125C53.6 34.965 55 32.5925 55 30C55 27.4075 53.6 25.035 50.8 20.2875L49.3275 17.7875C46.37 12.77 44.8925 10.2625 42.4025 8.8825C39.91 7.5 36.865 7.5 30.775 7.5Z" stroke="#E36F6F" strokeWidth="3.75" strokeLinecap="round" strokeLinejoin="round" /></svg></p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {editorMode && (
            <div style={{ marginLeft: '30px', marginTop: '10px', borderLeft: '2px solid #eee', paddingLeft: '15px' }}>
               <AccountEditor
                  accountId={accountId}
                  replyComment={editorMode === 'reply' ? { parent_id: id, text: '', author_nickname: author_nickname } : undefined}
                  editComment={editorMode === 'edit' ? { parent_id: id, text: text, author_nickname: author_nickname } : undefined}
                  cancelAction={handleCancelEditor}
                  setResult={setResult}
               />
            </div>
         )}

         {children && children.length > 0 && (
            <div className="comment__reply active" style={{ marginLeft: '30px' }}> {/* Добавлен отступ для вложенных */}
               {children.map((childComment) => (
                  <AccountCommenItem
                     {...childComment}
                     key={childComment.id}
                     setResult={setResult}
                     accountId={accountId}
                     onAction={onAction}
                  />
               ))}
            </div>
         )}
         {/* Add CSS for text color classes */}
         <style>{`
            .comment-content {
               word-wrap: break-word;
               overflow-wrap: break-word;
            }
            /* Text color classes */
            .text-black { color: #000000 !important; }
            .text-red { color: #ff0000 !important; }
            .text-blue { color: #0000ff !important; }
            .text-green { color: #008000 !important; }
            .text-purple { color: #800080 !important; }
            .text-orange { color: #ffa500 !important; }
            .text-brown { color: #a52a2a !important; }
            .text-gray { color: #808080 !important; }
            .text-maroon { color: #800000 !important; }
            .text-teal { color: #008080 !important; }
         `}</style>
      </>
   );
};

export default AccountCommenItem;