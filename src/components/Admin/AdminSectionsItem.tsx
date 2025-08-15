import { useState, useEffect, useRef } from "react";

import { ISection } from "../../types/Admin";
import TextEditor from "../UX/TextEditor";
import Layout from "../UX/Layout";
import SuccessModal from "../UX/modals/SuccessModal";
import ErrorModal from "../UX/modals/ErrorModal";

interface IAdminSectionsItemProps {
   section: ISection;
   setSections: React.Dispatch<React.SetStateAction<ISection[]>>;
}

const AdminSectionsItem = ({ section, setSections }: IAdminSectionsItemProps) => {
   const [layout, setLayout] = useState<number>(section.layout);
   const [message, setMessage] = useState<string>(section.text);
   const [localMediaItems, setLocalMediaItems] = useState<(string | File)[]>(section.mediaItems || []);
   const [dropdownLayouts, setDropdownLayouts] = useState<boolean>(false);
   const [replacedFiles, setReplacedFiles] = useState<{ [key: number]: File }>({});
   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
   const [successMessage, setSuccessMessage] = useState<string>('');
   const [errorMessage, setErrorMessage] = useState<string>('');

   const layoutNames: string[] = ['Текст | Изображение', 'Изображение | Текст', 'Текст', 'Текст | 2 Изображения', '2 Изображения | Текст', 'Изображение | Изображение', 'Изображение | 2 Изображения', '2 Изображения | Изображение', '3 Изображения'];

   const basicUrl = 'http://localhost:5000';

   const replaceFileInputRef = useRef<HTMLInputElement>(null);
   const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

   useEffect(() => {
      setSections(prev =>
         prev.map(s =>
            s.id === section.id ? {
               ...s,
               layout,
               text: message,
               mediaItems: localMediaItems,
               replacedFiles
            } : s
         )
      );
   }, [layout, message, localMediaItems, replacedFiles, section.id, setSections]);

   const handleSaveSection = async () => {
      try {
         const formData = new FormData();
         const fileReplacements: { [key: string]: any } = {};
         const retainedMediaItems: string[] = [];

         const sectionData = {
            id: section.id,
            section_order: 0,
            layout_id: layout,
            content: message,
            mediaItems: [] as any[]
         };

         localMediaItems.forEach((item, index) => {
            if (typeof item === 'string') {
               sectionData.mediaItems.push(item);
               retainedMediaItems.push(item);
            } else {
               sectionData.mediaItems.push(`/uploads/page_name/${item.name}`);
               formData.append(`file_${section.id}_${index}`, item); // <— ключ для бэкенда

               if (replacedFiles[index]) {
                  const originalItem = section.mediaItems?.[index];
                  fileReplacements[index] = {
                     name: item.name,
                     size: item.size,
                     originalPath: typeof originalItem === 'string' ? originalItem : undefined
                  };
               }
            }
         });


         formData.append('page_name', 'page_name');
         formData.append('sections', JSON.stringify([sectionData]));
         formData.append('file_replacements', JSON.stringify({ [section.id]: fileReplacements }));
         formData.append('retained_media_items', JSON.stringify(retainedMediaItems));

         const response = await fetch(`${basicUrl}/save-sections`, {
            method: 'POST',
            body: formData
         });

         const result = await response.json();
         if (response.ok) {
            setSuccessMessage(result.message);
            setIsSuccessModalOpen(true);
            setReplacedFiles({});
         } else {
            setErrorMessage(result.error);
            setIsErrorModalOpen(true);
         }
      } catch (error) {
         setErrorMessage('Ошибка при сохранении секции');
         setIsErrorModalOpen(true);
         console.error('Ошибка:', error);
      }
   };


   const handleAddFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
         const newFiles = Array.from(event.target.files);
         setLocalMediaItems(prevItems => [...prevItems, ...newFiles]);
         setSuccessMessage("Файлы успешно добавлены");
         setIsSuccessModalOpen(true);
         event.target.value = '';
      }
   };

   const handleReplaceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && replaceIndex !== null) {
         const newFile = event.target.files[0];
         setLocalMediaItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[replaceIndex] = newFile;
            return updatedItems;
         });
         setReplacedFiles(prev => ({
            ...prev,
            [replaceIndex]: newFile
         }));
         setSuccessMessage("Файл успешно заменен");
         setIsSuccessModalOpen(true);
         event.target.value = '';
         setReplaceIndex(null);
      }
   };

   const triggerReplaceFileInput = (index: number) => {
      setReplaceIndex(index);
      if (replaceFileInputRef.current) {
         replaceFileInputRef.current.click();
      }
   };

   const setMessageHandler = (text: string) => {
      if (text.length > 5000) {
         setErrorMessage("Текст не может быть длиннее 5000 символов");
         setIsErrorModalOpen(true);
         return;
      }
      setMessage(text);
   };

   const setLayoutHandler = (layoutNum: number) => {
      setLayout(layoutNum);
      setDropdownLayouts(false);
      setSuccessMessage("Макет успешно изменен");
      setIsSuccessModalOpen(true);
   };

   const removeMediaHandler = (indexToRemove: number) => {
      setLocalMediaItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
      setReplacedFiles(prev => {
         const updated = { ...prev };
         delete updated[indexToRemove];
         const newReplaced: { [key: number]: File } = {};
         Object.keys(updated).forEach(key => {
            const numKey = parseInt(key);
            if (numKey > indexToRemove) {
               newReplaced[numKey - 1] = updated[numKey];
            } else {
               newReplaced[numKey] = updated[numKey];
            }
         });
         return newReplaced;
      });
      setSuccessMessage("Элемент успешно удален");
      setIsSuccessModalOpen(true);
   };

   const removeSectionHandler = () => {
      setSections(prev => prev.filter(s => s.id !== section.id));
   };

   const urlsForLayout = localMediaItems.map(item => {
      if (typeof item === 'string') {
         return item.startsWith('/') ? `${basicUrl}${item}` : item;
      } else {
         return URL.createObjectURL(item);
      }
   });

   return (
      <div className="admin-section-editor">
         <div className="admin-section-editor__item">
            <div className="admin-section-editor__text">
               <div className="admin-accounts-get__files">
                  <input type="file" accept=".jpg, .mp4, .MOV, .png, .gif, .webp" multiple onChange={handleAddFileChange} />
               </div>
               <input
                  type="file"
                  accept=".jpg, .mp4, .MOV, .png, .gif, .webp"
                  onChange={handleReplaceFileChange}
                  ref={replaceFileInputRef}
                  style={{ display: 'none' }}
               />
               <TextEditor content={message} setContent={setMessageHandler} />
            </div>
            <div className="admin-section-editor__layout">
               <div className={`admin-section-dropdown ${dropdownLayouts && 'active' || ''}`}>
                  <div className="admin-sections-editor__buttons">
                     <button className="admin-section-dropdown__button btn" onClick={() => setDropdownLayouts(prev => !prev)}>
                        <span>{layoutNames[layout]}</span>
                        <svg width="15" height="10" viewBox="0 0 28 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1.5 1L14 13.5L26.5 1" stroke="grey" strokeWidth="2" />
                        </svg>
                     </button>
                     <button className="btn" onClick={handleSaveSection} style={{ background: '#79C0AD', color: 'white', marginRight: '10px' }}>
                        Сохранить
                     </button>
                     <svg onClick={removeSectionHandler} width="30" height="30" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
                        <path d="M55.4166 11.6667H45.2083L42.2916 8.75H27.7083L24.7916 11.6667H14.5833V17.5H55.4166M17.5 55.4167C17.5 56.9638 18.1146 58.4475 19.2085 59.5415C20.3025 60.6354 21.7862 61.25 23.3333 61.25H46.6666C48.2137 61.25 49.6975 60.6354 50.7914 59.5415C51.8854 58.4475 52.5 56.9638 52.5 55.4167V20.4167H17.5V55.4167Z" fill="#E36F6F" />
                     </svg>
                  </div>
                  <div className="admin-section-dropdown__main">
                     {layoutNames.map((name, index) => (
                        <button key={index} className="admin-section-dropdown__option btn" onClick={() => setLayoutHandler(index)}>
                           {name}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="admin-accounts-get__images" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {localMediaItems.map((item, index) => {
                     const isImage = typeof item === 'string'
                        ? item.match(/\.(jpeg|jpg|png|gif|webp)$/i)
                        : item.type.startsWith('image/');
                     const src = typeof item === 'string'
                        ? (item.startsWith('/') ? `${basicUrl}${item}` : item)
                        : URL.createObjectURL(item);
                     return (
                        <div key={index} className="admin-accounts-get__image" style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
                           {isImage ? (
                              <img src={src} alt="Медиа" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (
                              <video src={src} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           )}
                           <div
                              className="admin-accounts-get__image-overlay"
                              style={{
                                 position: 'absolute',
                                 top: 0,
                                 left: 0,
                                 width: '100%',
                                 height: '100%',
                                 backgroundColor: 'rgba(0,0,0,0.6)',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 opacity: 0,
                                 transition: 'opacity 0.3s ease',
                                 gap: '5px'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                           >
                              <button
                                 className="btn btn-sm"
                                 onClick={() => triggerReplaceFileInput(index)}
                                 style={{ background: '#79C0AD', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                 Заменить
                              </button>
                              <button
                                 className="btn btn-sm"
                                 onClick={() => removeMediaHandler(index)}
                                 style={{ background: '#E36F6F', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                 Удалить
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
               <Layout layoutId={layout} text={message} urls={urlsForLayout} />
            </div>
         </div>
         <SuccessModal isOpen={isSuccessModalOpen} setIsOpen={setIsSuccessModalOpen}>
            {successMessage}
         </SuccessModal>
         <ErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen}>
            {errorMessage}
         </ErrorModal>
      </div>
   );
};

export default AdminSectionsItem;