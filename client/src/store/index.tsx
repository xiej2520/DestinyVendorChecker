/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  Dispatch,
  useReducer,
} from "react";
import React from "react";
import { Character, SaleItemCategory, VendorName } from "./api/definitions";

type StoreState = {
  vendors: Record<Character, Partial<Record<VendorName, SaleItemCategory[]>>>;
  currentCharacter: Character;
  currentVendor: VendorName | null;
  pendingRequests: number;
};

export const enum StoreActionType {
  LOAD_VENDOR,
  SET_CURRENT_VENDOR,
  SET_CURRENT_CHARACTER,
  INCREMENT_PENDING_REQUESTS,
  DECREMENT_PENDING_REQUESTS,
  NONE,
}

type StoreAction =
  | {
      type: StoreActionType.LOAD_VENDOR;
      payload: { name: VendorName; character: Character, items: SaleItemCategory[] };
    }
  | {
      type: StoreActionType.SET_CURRENT_VENDOR;
      payload: { vendorName: VendorName };
    }
  | {
      type: StoreActionType.SET_CURRENT_CHARACTER;
      payload: { character: Character };
    }
  | { type: StoreActionType.INCREMENT_PENDING_REQUESTS; payload: undefined }
  | { type: StoreActionType.DECREMENT_PENDING_REQUESTS; payload: undefined };

const defaultStore: StoreState = {
  vendors: { "Hunter": {}, "Warlock": {}, "Titan": {}},
  currentVendor: null,
  currentCharacter: "Warlock",
  pendingRequests: 0,
};

const storeDefaultDispatch: Dispatch<StoreAction> = () => defaultStore;

export const StoreContext = createContext({
  state: defaultStore,
  dispatch: storeDefaultDispatch,
});

export const StoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeReducer = (
    store: StoreState,
    { type, payload }: StoreAction
  ): StoreState => {
    switch (type) {
      case StoreActionType.LOAD_VENDOR: {
        store.vendors[payload.character][payload.name] = payload.items;
        return { ...store };
      }
      case StoreActionType.SET_CURRENT_VENDOR: {
        store.currentVendor = payload.vendorName;
        return { ...store };
      }
      case StoreActionType.SET_CURRENT_CHARACTER: {
        store.currentCharacter = payload.character;
        return { ...store };
      }
      case StoreActionType.INCREMENT_PENDING_REQUESTS: {
        return { ...store, pendingRequests: store.pendingRequests + 1 };
      }
      case StoreActionType.DECREMENT_PENDING_REQUESTS: {
        return { ...store, pendingRequests: store.pendingRequests - 1 };
      }
      default:
        return store;
    }
  };

  const [store, storeDispatch] = useReducer(storeReducer, defaultStore);

  return (
    <StoreContext.Provider value={{ state: store, dispatch: storeDispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export function setCurrentVendor(
  dispatch: React.Dispatch<StoreAction>,
  vendorName: VendorName
) {
  dispatch({
    type: StoreActionType.SET_CURRENT_VENDOR,
    payload: { vendorName },
  });
}
export function incrementPendingRequests(dispatch: React.Dispatch<StoreAction>) {
  dispatch({
    type: StoreActionType.INCREMENT_PENDING_REQUESTS,
    payload: undefined,
  });
}
export function decrementPendingRequests(dispatch: React.Dispatch<StoreAction>) {
  dispatch({
    type: StoreActionType.DECREMENT_PENDING_REQUESTS,
    payload: undefined,
  });
}

export default {
  StoreContext,
  StoreContextProvider,
  setCurrentVendor,
  incrementPendingRequests,
  decrementPendingRequests,
};
