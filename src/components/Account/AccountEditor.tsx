import { useEffect, useState, useRef } from "react";
import Title from "../UX/Title"; // Убедитесь, что путь правильный
import { IAccountReplyComment, IAccountState, IComment } from "../../types/IAccounts"; // Убедитесь, что типы корректны
import IUser from "../../types/IUser";
import axios from "axios";
import DOMPurify from 'dompurify';
import { useNavigate } from "react-router-dom";

export interface AccountEditorProps { // Переименовал для ясности, так как это общий редактор
   replyComment?: IAccountReplyComment | null; // Allow null
   cancelAction: () => void;
   editComment?: IAccountReplyComment | null; // Allow null
   accountId: number;
   setResult: Function;
}

const AccountEditor = ({ replyComment, cancelAction, editComment, accountId, setResult }: AccountEditorProps) => {
   const apiUrlAdd: string = 'http://localhost:5000/add-comment';
   const apiUrlUpdate: string = 'http://localhost:5000/update-comment';
   const [error, setError] = useState<string | null>(null); // Сообщение об ошибке может быть строкой
   const [success, setSuccess] = useState<boolean>(false);
   const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
   const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
   const [activeColor, setActiveColor] = useState<string>("text-black");
   const storedUser = localStorage.getItem('user');
   const user: IUser | null = storedUser ? JSON.parse(storedUser) : null;
   const navigate = useNavigate()

   const emojiPickerRef = useRef<HTMLDivElement>(null);
   const colorPickerRef = useRef<HTMLDivElement>(null);
   const emojiButtonRef = useRef<HTMLButtonElement>(null);
   const colorButtonRef = useRef<HTMLButtonElement>(null);
   const editorRef = useRef<HTMLDivElement>(null);

   const emojis = [ /* ... ваш список эмодзи ... */
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
      '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧'
   ];
   const colorOptions = [ /* ... ваши опции цвета ... */
      { value: '#000000', class: 'text-black' }, { value: '#ff0000', class: 'text-red' },
      { value: '#0000ff', class: 'text-blue' }, { value: '#008000', class: 'text-green' },
      { value: '#800080', class: 'text-purple' }, { value: '#ffa500', class: 'text-orange' },
      { value: '#a52a2a', class: 'text-brown' }, { value: '#808080', class: 'text-gray' },
      { value: '#800000', class: 'text-maroon' }, { value: '#008080', class: 'text-teal' }
   ];

   useEffect(() => {
      if (editorRef.current) {
         let initialContent = ""; // По умолчанию пусто для ответа/редактирования
         if (editComment) {
            initialContent = editComment.text;
         } else if (replyComment) {
            // Для ответа начинаем с пустого поля. Если нужна цитата, добавьте ее сюда.
            // Например: initialContent = `<blockquote>${replyComment.text}</blockquote><p></p>`;
            initialContent = "";
         } else {
            // Это для нового комментария верхнего уровня (если этот редактор используется и так)
            initialContent = editorRef.current.innerHTML === "" || editorRef.current.innerHTML === "<p><br></p>" ? "Комментарий..." : editorRef.current.innerHTML;
         }
         editorRef.current.innerHTML = sanitizeComment(initialContent);

         // Логика плейсхолдера для нового комментария (не для ответа/редактирования)
         if (!editComment && !replyComment) {
            const handleFocus = () => {
               if (editorRef.current && editorRef.current.innerHTML === "Комментарий...") {
                  editorRef.current.innerHTML = "";
               }
            };
            const handleBlur = () => {
               if (editorRef.current && (editorRef.current.innerHTML === "" || editorRef.current.innerHTML === "<p><br></p>")) {
                  editorRef.current.innerHTML = "Комментарий...";
               }
            };
            editorRef.current.addEventListener('focus', handleFocus);
            editorRef.current.addEventListener('blur', handleBlur);
            return () => {
               if (editorRef.current) {
                  editorRef.current.removeEventListener('focus', handleFocus);
                  editorRef.current.removeEventListener('blur', handleBlur);
               }
            };
         } else if (editorRef.current && editorRef.current.innerHTML === "Комментарий...") {
            editorRef.current.innerHTML = ""; // Очистить плейсхолдер, если это редактирование/ответ
         }
      }
   }, [editComment, replyComment]); // Переинициализация при смене режима

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
         }
         if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node) && colorButtonRef.current && !colorButtonRef.current.contains(event.target as Node)) {
            setShowColorPicker(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const addCommentRecursively = (comments: IComment[], replyToCommentId: number, newComment: IComment): IComment[] => {
      return comments.map(comment => {
         if (comment.id === replyToCommentId) {
            return { ...comment, children: [...comment.children, newComment] };
         }
         if (comment.children && comment.children.length > 0) {
            return { ...comment, children: addCommentRecursively(comment.children, replyToCommentId, newComment) };
         }
         return comment;
      });
   };

   const updateCommentText = (comments: IComment[], commentIdToUpdate: number | undefined, newText: string): IComment[] => {
      return comments.map(comment => {
         if (comment.id === commentIdToUpdate) {
            return { ...comment, text: newText };
         }
         if (comment.children && comment.children.length > 0) {
            return { ...comment, children: updateCommentText(comment.children, commentIdToUpdate, newText) };
         }
         return comment;
      });
   };

   const sanitizeComment = (text: string) => {
      return DOMPurify.sanitize(text, {
         ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'strong', 'em', 'br', 'h1', 'h2', 'h3', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'span'],
         ALLOWED_ATTR: ['class'],
         ADD_ATTR: ['target'],
         FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
         FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
         ALLOW_DATA_ATTR: false
      });
   };

   // Исправления для функции handleSubmit в AccountEditor.tsx

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      const editorContent = editorRef.current?.innerHTML || '';
      if (!editorContent.trim() || editorContent === "Комментарий..." || editorContent === "<p><br></p>") {
         setError("Комментарий не может быть пустым.");
         setTimeout(() => setError(null), 3000);
         return;
      }
      const sanitizedComment = sanitizeComment(editorContent);

      try {
         if (editComment) { // Редактирование
            // Проверка наличия parent_id и правильное его использование
            const commentIdToUpdate = editComment.parent_id;
            if (!commentIdToUpdate) {
               setError("Ошибка: ID комментария не определен");
               setTimeout(() => setError(null), 3000);
               return;
            }

            // Журналирование отправляемых данных для отладки
            console.log("Updating comment with data:", { comment_id: commentIdToUpdate, text: sanitizedComment });

            await axios.put(apiUrlUpdate, {
               comment_id: commentIdToUpdate, // Используем как ID комментария
               text: sanitizedComment,
            });

            setResult((prev: IAccountState) => {
               if (prev.items) {
                  const updatedComments = updateCommentText(prev.items.comments, commentIdToUpdate, sanitizedComment);
                  return { ...prev, items: { ...prev.items, comments: updatedComments } };
               }
               return prev;
            });
            cancelAction(); // Закрыть редактор
         } else { // Добавление нового или ответ
            // Проверки наличия необходимых данных
            if (!accountId) {
               setError("Ошибка: ID аккаунта не определен");
               setTimeout(() => setError(null), 3000);
               return;
            }

            if (!user?.id) {
               setError("Ошибка: Пользователь не авторизован");
               setTimeout(() => setError(null), 3000);
               return;
            }

            // Журналирование отправляемых данных для отладки
            const requestData = {
               account_id: accountId,
               user_id: user.id,
               text: sanitizedComment,
               parent_id: replyComment ? replyComment.parent_id : null,
            };
            console.log("Adding comment with data:", requestData);

            await axios.post(apiUrlAdd, requestData);

            cancelAction(); // Закрыть редактор
         }
         setSuccess(true);
         if (editorRef.current) editorRef.current.innerHTML = ""; // Очистить поле после успеха
         navigate(0)
         setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
         console.error("API Error:", err.response || err);
         // Более подробное сообщение об ошибке с кодом ответа, если доступно
         const errorMessage = err.response?.status
            ? `Ошибка ${err.response.status}: ${err.response.data?.message || 'при обработке запроса'}`
            : "Ошибка соединения с сервером";
         setError(errorMessage);
         setTimeout(() => setError(null), 5000);
         setSuccess(false);
      }
   };

   const getSelection = (): { selectedText: string, range: Range } | null => { /* ... ваша функция ... */
      const selection = document.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (!editorRef.current?.contains(range.commonAncestorContainer)) return null;
      return { selectedText, range };
   };
   const handleFormat = (format: string) => { /* ... ваша функция ... */
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand(format, false);
   };
   const insertEmoji = (emoji: string) => { /* ... ваша функция ... */
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      setShowEmojiPicker(false);
   };
   const applyColor = (colorOption: { value: string, class: string }) => { /* ... ваша функция ... */
      if (!editorRef.current) return;
      editorRef.current.focus();
      setActiveColor(colorOption.class);
      setShowColorPicker(false);
      const selection = getSelection();
      if (selection && selection.selectedText.length > 0) {
         document.execCommand('delete', false);
         const formattedText = `<span class="${colorOption.class}">${selection.selectedText}</span>`;
         document.execCommand('insertHTML', false, formattedText);
      }
   };
   const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => { /* ... ваша функция ... */
      const inputEvent = e.nativeEvent as InputEvent;
      const inputData = inputEvent.data;
      if (activeColor !== 'text-black' && inputData !== null) {
         e.preventDefault();
         let formattedText;
         if (inputData === ' ') {
            formattedText = `<span class="${activeColor}">&nbsp;</span>`;
         } else {
            formattedText = `<span class="${activeColor}">${inputData}</span>`;
         }
         document.execCommand('insertHTML', false, formattedText);
      }
   };

   let editorTitle = "Оставить комментарий";
   let submitButtonText = "Добавить";

   if (editComment) {
      editorTitle = `Редактирование комментария`;
      submitButtonText = "Сохранить";
   } else if (replyComment && replyComment.author_nickname) {
      editorTitle = `Ответ для ${replyComment.author_nickname}:`;
      submitButtonText = "Ответить";
   }

   return (
      <div>
         <Title>{editorTitle}</Title>
         <form onSubmit={handleSubmit}>
            <div className="comment-editor">
               <div className="editor-toolbar">
                  <button type="button" onClick={() => handleFormat('bold')} className="toolbar-btn" title="Жирный"><span className="format-icon">B</span></button>
                  <button type="button" onClick={() => handleFormat('italic')} className="toolbar-btn" title="Курсив"><span className="format-icon">I</span></button>
                  <button type="button" onClick={() => handleFormat('underline')} className="toolbar-btn" title="Подчеркнутый"><span className="format-icon">U</span></button>
                  <button type="button" onClick={() => handleFormat('strikeThrough')} className="toolbar-btn" title="Зачеркнутый"><span className="format-icon">S</span></button>
                  <div className="toolbar-divider"></div>
                  <div className="dropdown-container">
                     <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="toolbar-btn emoji-btn" title="Смайлики" ref={emojiButtonRef}><span className="emoji-icon">😊</span></button>
                     {showEmojiPicker && (
                        <div className="emoji-picker" ref={emojiPickerRef}>
                           {emojis.map((emoji, index) => (
                              <button key={index} type="button" onClick={() => insertEmoji(emoji)} className="emoji-item">{emoji}</button>
                           ))}
                        </div>
                     )}
                  </div>
                  <div className="dropdown-container">
                     <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className={`toolbar-btn color-btn ${activeColor}`} title="Цвет текста" ref={colorButtonRef}><span className="color-icon">A</span></button>
                     {showColorPicker && (
                        <div className="color-picker" ref={colorPickerRef}>
                           {colorOptions.map((colorOption, index) => (
                              <button key={index} type="button" onClick={() => applyColor(colorOption)} className={`color-item ${activeColor === colorOption.class ? 'active' : ''}`} style={{ backgroundColor: colorOption.value }} title={colorOption.value} />
                           ))}
                        </div>
                     )}
                  </div>
               </div>
               <div
                  ref={editorRef}
                  contentEditable
                  className="rich-text-editor"
                  onBeforeInput={handleBeforeInput}
                  suppressContentEditableWarning={true}
                  // Добавьте aria-label для доступности
                  aria-label={editComment ? "Редактировать комментарий" : replyComment ? `Ответить ${replyComment.author_nickname}` : "Новый комментарий"}
               ></div>
               {error && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
               {success && <div className="success-message" style={{ color: 'green', marginTop: '5px' }}>Комментарий успешно отправлен.</div>}
            </div>
            <div className="comment-editor__rules">
               {(!editComment && !replyComment) && ( // Правила только для нового комментария верхнего уровня
                  <div>
                     <p className="text-muted small mt-2">
                        Запрещено использовать ненормативную лексику, оскорбление других пользователей, активные ссылки и рекламу.
                     </p>
                  </div>
               )}
               <div className="action-buttons" style={{ marginTop: '10px' }}>
                  {/* Кнопка "Отмена" всегда отображается, если это ответ или редактирование */}
                  {(replyComment || editComment) && (
                     <button type="button" onClick={cancelAction} className="btn">Отмена</button>
                  )}
                  <button type="submit" className="btn btn-info">
                     {submitButtonText}
                  </button>
               </div>
            </div>
         </form>
         <style>{`
            .comment-editor {
               display: flex;
               flex-direction: column;
               width: 100%;
               border: 1px solid #ddd;
               border-radius: 4px;
               overflow: hidden;
            }
            
            .editor-toolbar {
               display: flex;
               padding: 8px;
               background-color: #f5f5f5;
               border-bottom: 1px solid #ddd;
               flex-wrap: wrap;
               align-items: center;
            }
            
            .toolbar-btn {
               background: none;
               border: none;
               margin-right: 5px;
               cursor: pointer;
               padding: 5px;
               display: flex;
               align-items: center;
               justify-content: center;
               border-radius: 3px;
               height: 30px;
               width: 30px;
            }
            
            .toolbar-btn:hover {
               background-color: #e0e0e0;
            }
            
            .toolbar-btn.active {
               background-color: #d8d8d8;
            }
            
            .toolbar-divider {
               width: 1px;
               height: 20px;
               background-color: #ddd;
               margin: 0 8px;
            }
            
            .rich-text-editor {
               width: 100%;
               min-height: 150px;
               padding: 12px;
               border: none;
               font-family: Arial, sans-serif;
               font-size: 14px;
               outline: none;
               overflow: auto;
            }
            
            .rich-text-editor:empty:before {
               content: "Комментарий...";
               color: #aaa;
            }
            
            .comment-editor__rules {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-top: 10px;
            }
            
            .error-message {
               color: #d32f2f;
               margin: 8px;
               font-size: 14px;
            }
            
            .success-message {
               color: #388e3c;
               margin: 8px;
               font-size: 14px;
            }
            
            .format-icon {
               font-size: 14px;
               font-weight: 500;
            }
            
            .emoji-icon {
               font-size: 16px;
            }
            
            .color-icon {
               font-size: 16px;
               font-weight: bold;
            }
            
            /* Кнопка цвета показывает текущий активный цвет */
            .color-btn.text-black .color-icon { color: #000000; }
            .color-btn.text-red .color-icon { color: #ff0000; }
            .color-btn.text-blue .color-icon { color: #0000ff; }
            .color-btn.text-green .color-icon { color: #008000; }
            .color-btn.text-purple .color-icon { color: #800080; }
            .color-btn.text-orange .color-icon { color: #ffa500; }
            .color-btn.text-brown .color-icon { color: #a52a2a; }
            .color-btn.text-gray .color-icon { color: #808080; }
            .color-btn.text-maroon .color-icon { color: #800000; }
            .color-btn.text-teal .color-icon { color: #008080; }
            
            /* Dropdown styles */
            .dropdown-container {
               position: relative;
            }
            
            .emoji-picker {
               position: absolute;
               top: 100%;
               left: -200px;
               z-index: 1000;
               display: grid;
               grid-template-columns: repeat(10, 1fr);
               background-color: white;
               border: 1px solid #ddd;
               border-radius: 4px;
               box-shadow: 0 2px 5px rgba(0,0,0,0.2);
               padding: 5px;
            }
            
            .emoji-item {
               background: none;
               border: none;
               cursor: pointer;
               font-size: 16px;
               padding: 2px;
               border-radius: 3px;
            }
            
            .emoji-item:hover {
               background-color: #f0f0f0;
            }
            
            .color-picker {
               position: absolute;
               top: 100%;
               left: -120px;
               z-index: 1000;
               display: grid;
               grid-template-columns: repeat(5, 1fr);
               background-color: white;
               border: 1px solid #ddd;
               border-radius: 4px;
               box-shadow: 0 2px 5px rgba(0,0,0,0.2);
               padding: 5px;
               width: 150px;
            }
            
            .color-item {
               width: 24px;
               height: 24px;
               border: 1px solid #ddd;
               border-radius: 50%;
               cursor: pointer;
               margin: 2px;
            }
            
            .color-item.active {
               transform: scale(1.2);
               box-shadow: 0 0 5px rgba(0,0,0,0.5);
            }
            
            .color-item:hover {
               transform: scale(1.1);
               box-shadow: 0 0 3px rgba(0,0,0,0.3);
            }
            
            .action-buttons {
               display: flex;
               gap: 10px;
            }
         
            
            .mr-2 {
               margin-right: 10px;
            }
            
            .mt-2 {
               margin-top: 10px;
            }
            
            .small {
               font-size: 12px;
            }
            
            .text-muted {
               color: #6c757d;
            }
            
            /* Text color classes */
            .text-black { color: #000000; }
            .text-red { color: #ff0000; }
            .text-blue { color: #0000ff; }
            .text-green { color: #008000; }
            .text-purple { color: #800080; }
            .text-orange { color: #ffa500; }
            .text-brown { color: #a52a2a; }
            .text-gray { color: #808080; }
            .text-maroon { color: #800000; }
            .text-teal { color: #008080; }
         `}</style>
      </div>
   );
};

export default AccountEditor;