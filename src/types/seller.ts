import type { Party } from './invoice'

export interface SellerProfile extends Party {
  logo?: string
}

export const EMPTY_SELLER_PROFILE: SellerProfile = {
  name: '',
  gstin: '',
  address: '',
  state: '',
  stateCode: '',
  email: '',
  phone: '',
}
