export interface LoanStatus {
  id: number;
  person_name: string;
  bookid: number;
  barcode: string;
  book_name: string;
  outdate: Date;
  closedate: Date | null;
}

export interface LoanStatusInput {
  id: number;
  bookid: number;
  outdate?: Date;
  closedate?: Date | null;
} 