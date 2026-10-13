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

export type ItemPhoto = {
  slug: string
  url: string
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
  photos?: ItemPhoto[]
  is_active?: boolean
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
  last_purchase_quantity?: string | number | null
  description?: string
  remarks?: string
  photos?: ItemPhoto[]
  is_active?: boolean
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

export type UpdateItemPayload = AddItemPayload & {
  last_purchase_date?: string | null
  last_purchase_quantity?: string | null
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

export type ItemActivityKind = 'incoming' | 'outgoing' | 'item_edit';

export type ItemActivity = {
  slug: string
  kind: ItemActivityKind
  action: string
  recorded_on: string
  recorded_by: {
    slug: string
    full_name: string
    user_type: UserType
  }
  remarks: string
}

export type PurchaseStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'declined'
  | 'revision_requested'

  export type PurchaseRequest = {
    slug: string
    title: string
    status: PurchaseStatus
    space: string | null
    created_by: string
    created_at: string
    created_by_role: UserType
    notes?: string
    review_reason?: string
    lines?: {
      slug: string
      description: string
      quantity: string
      unit: string
      item?: string | null
      awarded_vendor?: string | null
    }[]
  }

export type PurchaseLinePayload = {
  description: string
  quantity: string
  unit: string
  item?: string
}

export type CreatePurchasePayload = {
  title: string
  notes: string
  space?: string
  lines: PurchaseLinePayload[]
}

export type PurchaseExportFormat = 'pdf' | 'xlsx'

export type PurchaseTrailEvent = {
  slug: string
  action: string
  actor_slug: string
  actor_user_type: UserType
  created_at: string
  resource_slug: string
  resource_type: string
  prev_hash: string
  content_hash: string
  signature: string
}

export type ProcessEventVerifyResult = {
  valid: boolean
  detail?: string
}

export type Vendor = {
  slug: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  gst?: string
  website?: string
  is_active?: boolean
}

export type VendorCreatePayload = {
  name: string
  contact_name: string
  phone: string
  address: string
  email?: string
  website?: string
  gst?: string
}

export type QuoteRequestStatus = 'preparing' | 'in_review' | 'awarding' | 'cancelled'

export type QuoteVendorStatus = 'invited' | 'quoted' | 'rejected' | 'awarded'

export type QuotePrice = {
  vendor: string
  unit_price: string | number
}

export type QuoteLineAward = {
  vendor: string
  quantity?: string | number
}

export type QuoteLine = {
  slug: string
  description: string
  quantity: string
  unit: string
  awarded_vendor?: string | null
  quantity_remaining?: string | number
  quotes: QuotePrice[]
  awards?: QuoteLineAward[]
}

export type PurchaseOrderLine = {
  slug: string
  description: string
  quantity: string
  unit: string
  unit_price: string | number
}

export type PurchaseOrder = {
  slug: string
  vendor: string
  purchase_request: string
  status: string
  is_new_order?: boolean
  lines?: PurchaseOrderLine[]
  created_at?: string
  updated_at?: string
}

export type QuoteRequestVendor = {
  vendor: string
  status: QuoteVendorStatus
  reject_reason?: string
}

export type QuoteRequest = {
  slug: string
  purchase_request: string
  status: QuoteRequestStatus
  notes?: string
  vendors: QuoteRequestVendor[]
  lines: QuoteLine[]
  created_at?: string
  updated_at?: string
}

export type RecordQuotePayload = {
  vendor: string
  notes?: string
  lines: { line: string; unit_price: string }[]
}