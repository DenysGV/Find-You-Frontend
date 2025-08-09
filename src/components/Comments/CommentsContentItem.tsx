import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import ICommentsState, { ICommentItem } from "../../types/ICommentsState"
import EditCommentModal from "../UX/modals/EditCommentModal"

const CommentsContentItem = ({
   id,
   account_id,
   parent_id,
   text,
   date_comment,
   author_nickname,
   quoted_author_nickname,
   quoted_comment_text,
   account_name,
   setResult
}: ICommentItem) => {
   const navigate = useNavigate()
   const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
   const [error, setError] = useState<string>('');
   const [success, setSuccess] = useState<string>('');
   const [comment, setComment] = useState<string>(text);
   const apiUrlUpdate: string = `http://localhost:5000/update-comment`
   const apiUrlRemove: string = `http://localhost:5000/delete-comment`

   const editComment = async () => {
      try {
         setError('')
         setSuccess('')

         await axios.put(apiUrlUpdate, {
            comment_id: id,
            text: comment
         })

         setSuccess('Комментарий успешно отредактирован')
         setIsOpenEdit(false)
         setResult((prev: ICommentsState) => ({
            ...prev,
            items: prev.items ? prev.items.map((commentItem) =>
               commentItem.id === id ? { ...commentItem, text: comment } : commentItem
            ) : prev.items
         }))
      } catch (error) {
         setError('Произошла ошибка при редактировании комментария')
      }
   }

   const removeComment = async () => {
      try {
         setError('')
         setSuccess('')

         await axios.delete(apiUrlRemove, {
            data: {
               comment_id: id
            }
         })

         setSuccess('Комментарий успешно удален')
         setIsOpenEdit(false)
         setResult((prev: ICommentsState) => ({
            ...prev,
            items: prev.items ? prev.items.filter((commentItem) => commentItem.id !== id) : prev.items
         }))
      } catch (error) {
         setError('Произошла ошибка при удалении комментария')
      }
   }

   // Функция для безопасного обрезания HTML-контента
   const truncateHtmlContent = (htmlContent: string, maxLength: number) => {
      if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;
      if (htmlContent.length <= maxLength) return htmlContent;

      // Создаем временный div для работы с HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Получаем текстовое содержимое без тегов
      const textContent = tempDiv.textContent || tempDiv.innerText;

      // Если текст короче maxLength, возвращаем исходный HTML
      if (textContent.length <= maxLength) return htmlContent;

      // Создаем регулярное выражение для поиска HTML тегов
      const tagRegex = /<[^>]+>/g;

      // Разбиваем строку на части: текст и теги
      const parts = htmlContent.split(tagRegex);
      const tags = htmlContent.match(tagRegex) || [];

      let currentLength = 0;
      let resultHtml = '';
      let tagIndex = 0;

      // Обрабатываем каждую текстовую часть
      for (let i = 0; i < parts.length; i++) {
         const part = parts[i];

         if (currentLength + part.length <= maxLength) {
            // Добавляем полную часть и соответствующий тег
            resultHtml += part;
            currentLength += part.length;

            if (tags[tagIndex]) {
               resultHtml += tags[tagIndex];
               tagIndex++;
            }
         } else {
            // Добавляем часть текста до лимита и многоточие
            const remainingLength = maxLength - currentLength;
            resultHtml += part.substring(0, remainingLength) + '...';
            break;
         }
      }

      // Анализируем открытые теги и закрываем их
      const openTags = [];
      const allTagsRegex = /<\/?([a-z]+)[^>]*>/gi;
      let match;

      while ((match = allTagsRegex.exec(resultHtml)) !== null) {
         const fullTag = match[0];
         const tagName = match[1].toLowerCase();

         if (fullTag.indexOf('</') === 0) {
            // Закрывающий тег - удаляем из стека
            const index = openTags.indexOf(tagName);
            if (index !== -1) {
               openTags.splice(index, 1);
            }
         } else if (fullTag.indexOf('/>') === -1) {
            // Открывающий тег, не самозакрывающийся - добавляем в стек
            openTags.push(tagName);
         }
      }

      // Закрываем все открытые теги в обратном порядке
      for (let i = openTags.length - 1; i >= 0; i--) {
         resultHtml += `</${openTags[i]}>`;
      }

      return resultHtml;
   };

   // Функция для безопасного рендеринга HTML в React
   const createMarkup = (htmlContent: string) => {
      return { __html: htmlContent };
   };

   // Обрабатываем текст для корректного обрезания
   const truncatedText = text.length > 100 ? truncateHtmlContent(text, 100) : text;

   return (
      <div className="comment">
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {success && <p style={{ color: 'green' }}>{success}</p>}
         <div className="comment-header">
            <p className="comment-header__title">
               <span>{account_name}</span>
               <svg
                  onClick={() => { navigate(`/${account_id}`) }}
                  width="20" height="20" viewBox="0 0 70 70"
                  fill="none" xmlns="http://www.w3.org/2000/svg"
               >
                  <path d="M45.3629 45.3629C47.2751 43.4507 48.792 41.1805 49.8269 38.6821C50.8618 36.1836 51.3945 33.5058 51.3945 30.8015C51.3945 28.0971 50.8618 25.4193 49.8269 22.9209C48.792 20.4224 47.2751 18.1522 45.3629 16.24C43.4507 14.3278 41.1805 12.8109 38.6821 11.776C36.1836 10.7411 33.5058 10.2084 30.8014 10.2084C28.0971 10.2084 25.4193 10.7411 22.9208 11.776C20.4224 12.8109 18.1522 14.3278 16.24 16.24C12.378 20.1019 10.2084 25.3398 10.2084 30.8015C10.2084 36.2631 12.378 41.501 16.24 45.3629C20.1019 49.2249 25.3398 51.3945 30.8014 51.3945C36.2631 51.3945 41.501 49.2249 45.3629 45.3629ZM45.3629 45.3629L58.3333 58.3333" stroke="#79C0AD" strokeWidth="4.375" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </p>
            <div className="comment-header__button">
               {/* Заменяем старую модалку на новую */}
               <EditCommentModal
                  isOpen={isOpenEdit}
                  setIsOpen={setIsOpenEdit}
                  comment={comment}
                  setComment={setComment}
                  editComment={editComment}
                  removeComment={removeComment}
                  id={id}
                  parent_id={parent_id}
                  accountId={account_id}
                  setResult={setResult}
                  author_nickname={author_nickname}
               >
                  <svg
                     style={{ margin: '0 0 0 auto', cursor: 'pointer' }}
                     width="20" height="20" viewBox="0 0 60 60"
                     fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                     <path fillRule="evenodd" clipRule="evenodd" d="M35.52 12.075C36.6533 12.425 37.7367 12.875 38.77 13.425L43.3525 10.675C43.8303 10.3884 44.3902 10.2696 44.9432 10.3376C45.4963 10.4055 46.0107 10.6563 46.405 11.05L48.95 13.595C49.3437 13.9893 49.5945 14.5037 49.6624 15.0568C49.7303 15.6098 49.6116 16.1697 49.325 16.6475L46.575 21.23C47.125 22.2633 47.575 23.3467 47.925 24.48L53.1075 25.7775C53.6481 25.9129 54.128 26.2251 54.4709 26.6645C54.8137 27.1038 55 27.6452 55 28.2025V31.7975C55 32.3548 54.8137 32.8962 54.4709 33.3355C54.128 33.7749 53.6481 34.0871 53.1075 34.2225L47.925 35.52C47.575 36.6533 47.125 37.7367 46.575 38.77L49.325 43.3525C49.6116 43.8303 49.7303 44.3902 49.6624 44.9432C49.5945 45.4963 49.3437 46.0107 48.95 46.405L46.405 48.95C46.0107 49.3437 45.4963 49.5945 44.9432 49.6624C44.3902 49.7303 43.8303 49.6116 43.3525 49.325L38.77 46.575C37.7367 47.125 36.6533 47.575 35.52 47.925L34.2225 53.1075C34.0871 53.6481 33.7749 54.128 33.3355 54.4709C32.8962 54.8137 32.3548 55 31.7975 55H28.2025C27.6452 55 27.1038 54.8137 26.6645 54.4709C26.2251 54.128 25.9129 53.6481 25.7775 53.1075L24.48 47.925C23.3567 47.5779 22.2686 47.1259 21.23 46.575L16.6475 49.325C16.1697 49.6116 15.6098 49.7303 15.0568 49.6624C14.5037 49.5945 13.9893 49.3437 13.595 48.95L11.05 46.405C10.6563 46.0107 10.4055 45.4963 10.3376 44.9432C10.2696 44.3902 10.3884 43.8303 10.675 43.3525L13.425 38.77C12.8741 37.7314 12.4221 36.6433 12.075 35.52L6.8925 34.2225C6.3523 34.0872 5.87275 33.7754 5.52991 33.3365C5.18707 32.8977 5.00057 32.3569 5 31.8V28.205C5.00001 27.6477 5.18626 27.1063 5.52914 26.667C5.87202 26.2276 6.35188 25.9154 6.8925 25.78L12.075 24.4825C12.425 23.3492 12.875 22.2658 13.425 21.2325L10.675 16.65C10.3884 16.1722 10.2696 15.6123 10.3376 15.0593C10.4055 14.5062 10.6563 13.9918 11.05 13.5975L13.595 11.05C13.9893 10.6563 14.5037 10.4055 15.0568 10.3376C15.6098 10.2696 16.1697 10.3884 16.6475 10.675L21.23 13.425C22.2633 12.875 23.3467 12.425 24.48 12.075L25.7775 6.8925C25.9128 6.3523 26.2246 5.87275 26.6635 5.52991C27.1023 5.18707 27.6431 5.00057 28.2 5H31.795C32.3523 5.00001 32.8937 5.18626 33.333 5.52914C33.7724 5.87202 34.0846 6.35188 34.22 6.8925L35.52 12.075ZM30 40C32.6522 40 35.1957 38.9464 37.0711 37.0711C38.9464 35.1957 40 32.6522 40 30C40 27.3478 38.9464 24.8043 37.0711 22.9289C35.1957 21.0536 32.6522 20 30 20C27.3478 20 24.8043 21.0536 22.9289 22.9289C21.0536 24.8043 20 27.3478 20 30C20 32.6522 21.0536 35.1957 22.9289 37.0711C24.8043 38.9464 27.3478 40 30 40Z" fill="#E36F6F" />
                  </svg>
               </EditCommentModal>
            </div>
         </div>
         <div className="comment-user">{author_nickname}</div>
         {parent_id && <div className="quote">
            <strong>Цитата:</strong> {quoted_author_nickname}<br />
            <div dangerouslySetInnerHTML={createMarkup(quoted_comment_text)} />
         </div>}
         <div className="comment-text">
            <div dangerouslySetInnerHTML={createMarkup(truncatedText)} />
         </div>
         <div className="timestamp">{dayjs(new Date(date_comment)).format("DD.MM.YYYY")}</div>
      </div>
   )
}

export default CommentsContentItem