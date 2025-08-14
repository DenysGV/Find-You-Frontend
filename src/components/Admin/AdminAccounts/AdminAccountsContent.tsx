import { useState } from "react";
import axios from "axios";
import { IComment } from "../../../types/IAccounts";
import Title from "../../UX/Title";
import AdminAccountsEdit from "../AdminAccountsEdit";
import IUser from "../../../types/IUser";

const AdminAccountsContent = () => {
   const apiUrlUpload = 'http://62.169.27.192/api/upload-file'
   const [file, setFile] = useState<File | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [success, setSuccess] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
         setFile(selectedFile);
      }
   };

   const handleUpload = async () => {
      if (!file) {
         setError("Выберите файл!");
         return;
      }

      setLoading(true);
      setError(null);

      try {
         const formData = new FormData();
         formData.append("file", file);

         await axios.post(apiUrlUpload, formData, {
            headers: { "Content-Type": "multipart/form-data" },
         });

         setSuccess(true);
      } catch (err: any) {
         setError(err.response?.data?.message || "Ошибка запроса");
      } finally {
         setLoading(false);
      }
   };

   const showComments = (items: IComment[]) => {
      return items.map(item => (
         <div>
            <p>{item.author_nickname} {item.time_comment}</p>
            <p dangerouslySetInnerHTML={{ __html: item.text }} />
            <div style={{ margin: '0 0 0 15px' }}>
               {showComments(item.children)}
            </div>
         </div>
      ))
   }

   if (user?.role != 'admin' && user?.role != 'moder') {
      return
   }

   return (
      <div className="admin-accounts">
         <Title classes='pt'>Аккаунты</Title>
         {loading && <div className="loader">
            <div className="loader__circle"></div>
         </div>}
         <div>
            <h5>Массовая загрузка</h5>
            <div className="admin-accounts-get__form">
               <input type="file" accept=".txt" onChange={handleFileChange} />
               <button className="btn btn-info" onClick={handleUpload} disabled={loading}>
                  {loading ? "Загрузка..." : "Отправить"}
               </button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>Файлы успешно добавленны</p>}
         </div>
         <h5>Получение аккаунта</h5>
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {success && <p style={{ color: 'green' }}>{success}</p>}
         <AdminAccountsEdit />
      </div>
   )
}

export default AdminAccountsContent