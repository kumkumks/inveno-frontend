export type UserType =
  | 'super_admin'
  | 'central_admin'
  | 'operation_incharge'
  | 'warehouse_manager'
  | 'space_incharge';

export type AccessTokenResponse = {
  access: string;
};

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
