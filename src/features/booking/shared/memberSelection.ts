"use client";

/** Reuse the booking member store so both flows share one selection. */
import {
  resetBookingMemberSelection as _reset,
  chooseBookingMember as _choose,
  getBookingMemberSelection as _get,
  getServerBookingMemberSelection as _getServer,
  protectConfirmedBookingMember as _protect,
  rememberBookingMembers as _remember,
  subscribeBookingMembers as _subscribe,
} from "../design20/memberSelection";

export const resetBookingMemberSelection = _reset;
export const chooseBookingMember = _choose;
export const getBookingMemberSelection = _get;
export const getServerBookingMemberSelection = _getServer;
export const protectConfirmedBookingMember = _protect;
export const rememberBookingMembers = _remember;
export const subscribeBookingMembers = _subscribe;
export type { BookingMember, BookingMemberSelection } from "../design20/memberSelection";

