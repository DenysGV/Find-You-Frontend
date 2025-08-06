import { IAccountAll, ISocials } from "./IAccounts";
import IOrder from "./IOrder";

export interface IAdminAccountsEditSocial extends ISocials {
   setAccountSocials: Function
}

export interface IAdminOrdersItemProps extends IOrder {
   setResult: Function
   openSendMessageModal: Function
}

export interface IAdminUser {
   id: number;
   login: string;
   avatar: { type: string; data: number[]; } | null;
   date_of_create: string;
   mail: string;
   session_id: string | null;
   role: string; // Если используем COALESCE, role всегда строка (может быть пустой)
}

export interface IAdminUsersContentItem {
   user: IAdminUser,
   setUsersSelected: Function,
}

export interface IAdminUsersState {
   users: IAdminUser[],
   setUsers: Function,
   setUsersSelected: Function,
}

export interface IAdminUserToolbar {
   setResult: Function,
   setSelected: Function
   userId: number
}

export interface IAdminReport {
   id: number;
   comment_id: number;
   reported_user_id: number;
   reported_user_login: string;
   reporter_user_id: number;
   reporter_user_login: string;
   account_id: number; // ID аккаунта
   account_name: string; // Имя аккаунта
   report_text: string;
   created_at: string;
   comment_text: string;
}


export interface IAdminReportsState {
   items: IAdminReport[] | null,
   loading: boolean,
   error: boolean,
}

export interface IAdminReportsItemState extends IAdminReport {
   setResult: Function
}

export interface IAdminAccountAll extends Omit<IAccountAll, "files"> {
   files: (File | string)[],
}

export interface IAdminSectionsItem {
   setSections: Function,
   id: number
}

export interface ISection {
   id: number,
   layout: number,
   text: string,
   mediaItems: (string | File)[];
}

export interface IAdminSection {
   id: number;
   image_identifier: string;
   page_name: string;
   section_order: number;
   layout_id: number;
   content: string;
   images: string[];
   created_at: Date
}

export interface IAdminSections {
   sections: IAdminSection[],
   images: string[]
}

export interface ILayout {
   layoutId: number,
   text: string,
   urls: string[],
   publicComponent?: boolean
}