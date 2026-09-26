export type UserType =
  | 'super_admin'
  | 'central_admin'
  | 'operation_incharge'
  | 'warehouse_manager'
  | 'space_incharge';

export type AccessTokenResponse = {
  access: string;
};

export type NamedValue = string | { name?: string; slug?: string } | null | undefined

export type NamedOption = {
  slug: string
  name: string
}

export type Item = {
  id?: number | string
  slug: string
  name: string
  category: string
  part_number: string
  alternate_part_number: string
  location: string
  warehouse: string
  quantity_on_hand: string
  unit: string
  last_purchase_date: string
}

export type ItemDetail = {
  slug?: string
  name?: string
  category?: NamedValue
  part_number?: string
  alternate_part_number?: string
  location?: NamedValue
  warehouse?: NamedValue
  quantity_on_hand?: string | number
  unit?: string
  last_purchase_date?: string | null
  description?: string
  remarks?: string
  image?: string
}

export type AddItemPayload = {
  warehouse: string
  name: string
  unit: string
  description: string
  part_number: string
  alternate_part_number: string
  category: string
  location: string
  remarks: string
}

export type MeResponse = {
  id: string;
  email: string;
  date_joined: string;
  updated_at: string;
  profile: {
    user_type: UserType;
    first_name: string;
    last_name: string;
    phone: string;
    full_name: string;
    space: { slug: string; name: string } | null;
  } | null;
  org: {
    id: string;
    name: string;
    org_suffix: string;
    location: string;
    is_active: boolean;
    registered_on: string;
  } | null;
};
