export type IMembership = {
  name: string;
  description: string;
  point: number;
};

export type IAddress = {
  _id?: string;
  address: string;
  full_name: string;
  phone: string;
  default_address: boolean;
};

export type ISearchProduct = {
  _id?: string;
  keyword: string;
  created_at: string;
};

export const Membership = {
  name: String,
  description: String,
  point: Number,
};

export const Address = {
  address: String,
  full_name: String,
  phone: String,
  default_address: Boolean,
};

export const SearchProduct = {
  keyword: String,
  created_at: String,
};
