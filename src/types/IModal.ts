import IMessage from "./IMessage"

export default interface IModal {
   isOpen: boolean,
   setIsOpen: Function
   children: React.ReactNode
}

export interface IModalRead extends IMessage {
   isOpen: boolean,
   setIsOpen: Function
   children: React.ReactNode
   responseHandler: Function
   onMessageRead: Function
   onModalClose?: () => void; // Новое свойство для обработки закрытия модального окна
}

export interface IModalSend extends IModal {
   responseLogin: string
   setResponseLogin: Function
}

export interface IModalRecovery extends IModal {
   login: string,
   password: string,
   randomNum: number,
   error: string,
   setError: Function,
   sendCode: Function,
   timer: number,
   setTimer: Function,
}

export interface IModalComment extends IModal {
   setComment: Function;
   comment: string;
   editComment: Function;
   removeComment: Function;
}

export interface IModalGallery {
   isOpen: boolean;
   setIsOpen: (isOpen: boolean) => void;
   children: React.ReactNode;
   currentIndex?: number;
   totalImages?: number;
   onPrev?: () => void;
   onNext?: () => void;
}