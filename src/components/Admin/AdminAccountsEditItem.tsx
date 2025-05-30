import dayjs from "dayjs"
import { IAccount, IHomeAccount } from "../../types/IAccounts"
import { useNavigate } from "react-router-dom"
import transformPhoto from "../../utils/transformPhoto"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import AdminAccountsEditSocial from "./AdminAccountsEditSocial"
import { IAdminAccountAll } from "../../types/Admin"

const AdminAccountsEditItem = ({
   account,
   setAccountsSelected,
   apiUrl,
   apiUrlGet,
   apiUrlUpdate,
   apiUrlDateUpdate,
   apiUrlAccUpdate,
   setError,
   setSuccess,
   updateAccount
}: {
   account: IHomeAccount,
   setAccountsSelected: Function,
   apiUrl: string,
   apiUrlGet: string,
   apiUrlUpdate: string,
   apiUrlDateUpdate: string,
   apiUrlAccUpdate: string,
   setError: Function, // Функция будет вызывать модальное окно
   setSuccess: Function // Функция будет вызывать модальное окно
   updateAccount: Function // Функция для обновления account в родительском компоненте
}) => {
   const navigate = useNavigate()
   const [isChecked, setIsChecked] = useState<boolean>(false)
   const [isEditing, setIsEditing] = useState<boolean>(false)
   const [loading, setLoading] = useState<boolean>(false)
   const [accountDetail, setAccountDetail] = useState<IAdminAccountAll | null>(null)
   const [localAccount, setLocalAccount] = useState<IHomeAccount>(account)

   // Состояния для редактирования
   const [accountName, setAccountName] = useState<string>('')
   const [accountCity, setAccountCity] = useState<string>('')
   const [accountTags, setAccountTags] = useState<string>('')
   const [accountSocials, setAccountSocials] = useState<any[]>([])
   const [accountDate, setAccountDate] = useState<string>('')
   const [accountPhoto, setAccountPhoto] = useState<File | null>(null)
   const [photoPreview, setPhotoPreview] = useState<string | null>(null)

   // Ref для input файла
   const fileInputRef = useRef<HTMLInputElement>(null)

   // Обновление предпросмотра при изменении accountPhoto
   useEffect(() => {
      if (accountPhoto) {
         const objectUrl = URL.createObjectURL(accountPhoto)
         setPhotoPreview(objectUrl)

         // Очистка URL объекта при размонтировании
         return () => URL.revokeObjectURL(objectUrl)
      }
   }, [accountPhoto])

   // Синхронизируем локальный account с пропсом account при изменении
   useEffect(() => {
      setLocalAccount(account);
   }, [account]);

   const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setIsChecked(checked);
      setAccountsSelected((prevSelected: number[]) =>
         checked
            ? [...prevSelected, localAccount.id]
            : prevSelected.filter(id => id !== localAccount.id)
      );

      // Если снимаем выделение, закрываем редактирование
      if (!checked) {
         setIsEditing(false);
      }
   };

   const handleEdit = async () => {
      if (!isEditing) {
         setLoading(true);
         try {
            const result = await axios.get(`${apiUrlGet}?id=${localAccount.id}`)
            setAccountDetail(result.data);
            setAccountName(result.data.account.name || '');
            setAccountCity(result.data.city?.name_ru || '');
            setAccountTags(result.data.tags.map((item: any) => item.name_ru).join(", ") || '');

            // Убедимся, что дата корректно обрабатывается, даже если она null
            setAccountDate(result.data.account.date_of_create || '');

            setAccountSocials(result.data.socials || []);
            setIsEditing(true);
            setSuccess('Аккаунт успешно получен');
         } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка при получении аккаунта, попробуйте ещё раз!';
            setError(errorMessage);
         } finally {
            setLoading(false);
         }
      } else {
         setIsEditing(false);
      }
   }

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || !selectedFiles.length) {
         setError("Можно загружать только JPG или MP4 файлы.");
         return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "video/mp4"];
      const file = selectedFiles[0];

      if (!allowedTypes.includes(file.type)) {
         setError("Можно загружать только JPG или MP4 файлы.");
         return;
      }

      setAccountPhoto(file);
      // Предпросмотр устанавливается через useEffect
   };

   // Функция для программного вызова диалога выбора файла
   const triggerFileInput = () => {
      if (fileInputRef.current) {
         fileInputRef.current.click();
      }
   };

   const saveHandlerPhoto = async () => {
      if (accountDetail) {
         try {
            if (!accountPhoto) {
               setError('Выберите фотку аккаунта');
               return;
            }

            const formData = new FormData();
            formData.append("photo", accountPhoto);
            formData.append("id", String(accountDetail.account.id));

            const response = await axios.post(apiUrlUpdate, formData, {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
            });

            if (response.data && response.data.result && response.data.result.photo) {
               const updatedPhotoData = response.data.result.photo;
               setAccountDetail(prev => prev ? { ...prev, account: { ...prev.account, photo: updatedPhotoData } } : null);
               const updatedAccountData: IAccount = {
                  ...localAccount,
                  photo: updatedPhotoData
               };

               setLocalAccount(updatedAccountData as IHomeAccount);

               updateAccount(updatedAccountData);

               setSuccess('Фото успешно обновлено');
               setAccountPhoto(null);
               if (fileInputRef.current) {
                  fileInputRef.current.value = "";
               }
            } else {
               console.error("Server response did not contain updated photo data at 'result.photo'. Response:", response.data);
               setError("Фото на сервере обновлено, но не удалось обновить миниатюру (неверный ответ сервера). Пожалуйста, обновите страницу.");
            }
         } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка при обновлении фото, попробуйте ещё раз!';
            setError(errorMessage);
         }
      }
   }

   const saveHandler = async () => {
      if (accountDetail && accountDetail.files) {
         const formData = new FormData();

         const links: string[] = [];

         accountDetail.files.forEach((item) => {
            if (typeof item === "string") {
               links.push(item);
            } else if (item instanceof File) {
               formData.append("files", item);
            }
         });

         formData.append("links", JSON.stringify(links));

         try {
            await axios.post(`${apiUrl}/account-edit-media?id=${accountDetail.account.identificator}`, formData);
            setSuccess('Аккаунт успешно сохранен');
         } catch (error: any) {
            // Получаем сообщение об ошибке от сервера, если оно есть
            const errorMessage = error.response?.data?.message || 'Ошибка при сохранении аккаунта, попробуйте ещё раз!';
            setError(errorMessage);
         }
      }
   }

   const updateDate = async (action: string) => {
      if (accountDetail) {
         try {
            let value: string | null = null;

            if (action === 'save') {
               // Убедимся, что дата отправляется в ISO формате, сохраняя часы и минуты
               if (accountDate) {
                  // Преобразуем строку в объект Date
                  const date = new Date(accountDate);
                  // Сохраняем в ISO формате, чтобы сохранить часы и минуты
                  value = date.toISOString();
               }
            }

            // Независимо от значения, делаем запрос
            await axios.post(apiUrlDateUpdate, {
               id: accountDetail.account.id,
               new_date_of_create: value
            });

            // Создаем обновленную версию аккаунта с новой датой
            const updatedAccount = {
               ...localAccount,
               date_of_create: action === 'save' ? new Date(accountDate) : null
            };

            // Обновляем локальный state
            setLocalAccount(updatedAccount);

            // Обновляем родительский компонент
            updateAccount(updatedAccount);

            // После успешного запроса обновляем поле ввода
            if (action === 'reset') {
               // Если это был сброс даты, очищаем значение в поле
               setAccountDate('');

               // Также обновляем данные в accountDetail
               setAccountDetail(prev => {
                  if (prev) {
                     return {
                        ...prev,
                        account: {
                           ...prev.account,
                           date_of_create: null
                        }
                     };
                  }
                  return prev;
               });
            }

            setSuccess(action === 'save' ? 'Дата успешно обновлена' : 'Дата успешно сброшена');
         } catch (error: any) {
            // Получаем сообщение об ошибке от сервера, если оно есть
            const errorMessage = error.response?.data?.message ||
               (action === 'save' ? 'Произошла ошибка при обновлении даты' : 'Произошла ошибка при сбросе даты');
            setError(errorMessage);
         }
      } else {
         setError('Для начала нужно получить пользователя');
      }
   };

   const updateAccInfo = async () => {
      if (accountDetail) {
         try {
            await axios.put(apiUrlAccUpdate, {
               id: accountDetail.account.id,
               name: accountName,
               city: accountCity,
               tags: accountTags,
               socials: accountSocials,
            });

            // Создаем обновленную версию аккаунта
            const updatedAccount = {
               ...localAccount,
               name: accountName
            };

            // Обновляем локальный state
            setLocalAccount(updatedAccount);

            // Обновляем родительский компонент
            updateAccount(updatedAccount);

            setSuccess('Аккаунт успешно изменен');
         } catch (error: any) {
            // Получаем сообщение об ошибке от сервера, если оно есть
            const errorMessage = error.response?.data?.message || 'Произошла ошибка при обновлении данных';
            setError(errorMessage);
         }
      } else {
         setError('Для начала нужно получить пользователя');
      }
   }

   const addAccountSocialsHandler = () => {
      setAccountSocials(prev => [...prev, {
         id: Number(new Date()),
         type_social_id: 1,
         text: '',
         social_name: 'Facebook'
      }]);
   }

   const deleteHandler = (index: number) => {
      if (accountDetail) {
         setAccountDetail(prev => {
            if (prev) {
               return {
                  ...prev,
                  files: [...prev.files].filter((_: string | File, idx: number) => idx != index)
               };
            }
            return prev;
         });
      }
   }

   const handleMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || !selectedFiles.length) {
         setError("Можно загружать только JPG или MP4 файлы.");
         return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "video/mp4"];
      const newFileUrls: File[] = [];

      for (const file of selectedFiles) {
         if (allowedTypes.includes(file.type)) {
            newFileUrls.push(file);
         } else {
            setError("Можно загружать только JPG или MP4 файлы.");
            return;
         }
      }

      setAccountDetail(prev => {
         if (prev) {
            return {
               ...prev,
               files: [...prev.files, ...newFileUrls]
            };
         }
         return prev;
      });
   };

   // Преобразует дату в формат для input с учетом часового пояса пользователя
   const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';

      // Создаем объект Date из строки даты
      const date = new Date(dateString);

      // Проверка на валидность даты
      if (isNaN(date.getTime())) return '';

      // Получаем год, месяц, день, часы и минуты с учетом местного часового пояса
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Форматируем в строку YYYY-MM-DDTHH:MM
      return `${year}-${month}-${day}T${hours}:${minutes}`;
   };

   // Функция для получения даты в будущем с учетом часового пояса
   const getFutureDate = (yearsAhead = 10) => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + yearsAhead);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
   };

   return (
      <>
         <div className="admin-accounts-edit__item">
            <div className="admin-accounts-edit__right">
               <input type="checkbox" onChange={handleCheckboxChange} checked={isChecked} />
               {isChecked && (
                  <svg
                     onClick={handleEdit}
                     width="22"
                     height="22"
                     viewBox="0 0 60 60"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                     style={{ cursor: 'pointer', marginLeft: '8px' }}
                  >
                     <path d="M12.5 47.5H16.0625L40.5 23.0625L36.9375 19.5L12.5 43.9375V47.5ZM7.5 52.5V41.875L40.5 8.9375C41 8.47917 41.5525 8.125 42.1575 7.875C42.7625 7.625 43.3975 7.5 44.0625 7.5C44.7275 7.5 45.3733 7.625 46 7.875C46.6267 8.125 47.1683 8.5 47.625 9L51.0625 12.5C51.5625 12.9583 51.9275 13.5 52.1575 14.125C52.3875 14.75 52.5017 15.375 52.5 16C52.5 16.6667 52.3858 17.3025 52.1575 17.9075C51.9292 18.5125 51.5642 19.0642 51.0625 19.5625L18.125 52.5H7.5ZM38.6875 21.3125L36.9375 19.5L40.5 23.0625L38.6875 21.3125Z"
                        fill="#79C0AD" />
                  </svg>
               )}
               <div className="admin-accounts-edit__img">
                  <img
                     src={transformPhoto(localAccount.photo)}
                     alt={`Аватар ${localAccount.name || 'аккаунта'}`}
                     onError={(e) => { e.currentTarget.src = '/images/blog_image.jpg'; }} // Добавил onError
                  />
               </div>
            </div>
            <p className="admin-accounts-edit__name">Название: <svg onClick={() => { navigate(`/${localAccount.id}`) }} width="20" height="20" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M45.3629 45.3629C47.2751 43.4507 48.792 41.1805 49.8269 38.6821C50.8618 36.1836 51.3945 33.5058 51.3945 30.8015C51.3945 28.0971 50.8618 25.4193 49.8269 22.9209C48.792 20.4224 47.2751 18.1522 45.3629 16.24C43.4507 14.3278 41.1805 12.8109 38.6821 11.776C36.1836 10.7411 33.5058 10.2084 30.8014 10.2084C28.0971 10.2084 25.4193 10.7411 22.9208 11.776C20.4224 12.8109 18.1522 14.3278 16.24 16.24C12.378 20.1019 10.2084 25.3398 10.2084 30.8015C10.2084 36.2631 12.378 41.501 16.24 45.3629C20.1019 49.2249 25.3398 51.3945 30.8014 51.3945C36.2631 51.3945 41.501 49.2249 45.3629 45.3629ZM45.3629 45.3629L58.3333 58.3333" stroke="#79C0AD" strokeWidth="4.375" strokeLinecap="round" strokeLinejoin="round" />
            </svg><br /><span>{localAccount.name}</span></p>
            <p className="admin-accounts-edit__date">Дата создания: <br />
               <span>
                  {localAccount.date_of_create
                     ? dayjs(localAccount.date_of_create).format("DD.MM.YYYY HH:mm")
                     : "Не указана"}
               </span>
            </p>
         </div>

         {isEditing && accountDetail && (
            <div className="admin-accounts-edit__form" style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
               {loading && <div className="loader">
                  <div className="loader__circle"></div>
               </div>}

               <div className="admin-accounts-get__block">
                  <h4>Медиа файлы</h4>
                  <div className="admin-accounts-get__images">
                     {accountDetail?.files.map((item, index) => {
                        let isImage = false;
                        let src = "";

                        if (item instanceof File) {
                           isImage = item.type.startsWith("image/");
                           src = URL.createObjectURL(item);
                        } else if (typeof item === "string") {
                           isImage = item.includes(".jpg") || item.includes(".jpeg") || item.includes(".png");
                           src = item.startsWith("blob") ? item : `${item}`;
                        }

                        return (
                           <div key={index} className="admin-accounts-get__image">
                              {isImage ? (
                                 <img src={src} alt="Image" />
                              ) : (
                                 <video src={src} autoPlay muted />
                              )}
                              <div onClick={() => deleteHandler(index)} className="admin-accounts-get__imageBg">
                                 <svg width="30" height="30" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
                                 </svg>
                              </div>
                           </div>
                        );
                     })}
                     <div className="admin-accounts-get__files">
                        <input type="file" accept=".jpg, .mp4" multiple onChange={handleMediaFileChange} />
                        <button className="btn btn-info" onClick={saveHandler}>Сохранить</button>
                     </div>
                  </div>
               </div>

               <hr />

               <div>
                  <h4>Информация о аккаунте</h4>
                  <div className="admin-accounts-get__time">
                     <p>Идентификатор : {accountDetail.account.identificator}</p>
                     <p>Имя :</p>
                     <input type="text" placeholder="Имя аккаунта" value={accountName} onChange={(e) => { setAccountName(e.target.value) }} />
                     <p>Город :</p>
                     <input type="text" placeholder="Город аккаунта" value={accountCity} onChange={(e) => { setAccountCity(e.target.value) }} />
                     <p>Тэги :</p>
                     <input type="text" placeholder="Тэги аккаунта" value={accountTags} onChange={(e) => { setAccountTags(e.target.value) }} />
                     <p>Контакты :</p>
                     {accountSocials.map(item => (
                        <AdminAccountsEditSocial key={item.id} {...item} setAccountSocials={setAccountSocials} />
                     ))}
                     <button className="btn btn-info admin-accounts-get__add" onClick={addAccountSocialsHandler}>Добавить контакт</button>
                     <button className="btn btn-info" onClick={updateAccInfo}>Сохранить</button>
                  </div>

                  <div className="admin-accounts-get__time">
                     <p>Указать дату создания :</p>
                     <input
                        type="datetime-local"
                        placeholder="Дата создания / публикации"
                        value={formatDateForInput(accountDate)}
                        onChange={(e) => { setAccountDate(e.target.value) }}
                        max={getFutureDate(10)}
                     />
                     <button className="btn btn-info" onClick={() => { updateDate('save') }}>Сохранить</button>
                     <button className="admin-accounts-get__reset" onClick={() => { updateDate('reset') }}>Сбросить дату</button>
                  </div>

                  <div className="admin-accounts-get__photo" onClick={triggerFileInput} style={{ cursor: 'pointer' }}>
                     {photoPreview ?
                        <img src={photoPreview} alt="Предпросмотр аватара" /> :
                        accountDetail.account.photo ?
                           <img src={transformPhoto(accountDetail.account.photo)} alt="Аватар аккаунта" /> :
                           <img src="/images/blog_image.jpg" alt="Заглушка" />
                     }
                  </div>
                  <div className="admin-accounts-get__files">
                     <input
                        type="file"
                        accept=".jpg,.jpeg"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'block', marginBottom: '10px' }}
                     />
                     <button
                        className="btn btn-info"
                        onClick={saveHandlerPhoto}
                        disabled={!accountPhoto}
                     >
                        Сохранить
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}

export default AdminAccountsEditItem