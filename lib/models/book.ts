export interface Book {
  id: number;
  barcode: string;
  name: string;
  num: string;
  author: string;
  fullname: string;
  category: string;
  authorcode: string;
  claimnum: string;
  copynum: string;
  isbn: string;
  publish: string;
  publishyear: string;
  attach: string;
  claim: string;
  registerdate: Date;
  moddate: Date;
  status: number; // 1: Active, 0: Inactive
  available?: number; // 1: Available, 0: Borrowed (calculated from OutIn table)
  oldcategory: string;
}

export interface BookInput {
  barcode: string;
  name: string;
  num: string;
  author: string;
  fullname: string;
  category: string;
  authorcode: string;
  claimnum: string;
  copynum: string;
  isbn: string;
  publish: string;
  publishyear: string;
  attach: string;
  claim: string;
  status?: number; // Optional for create/update operations
  available?: number; // Optional for create/update operations
  oldcategory: string;
} 