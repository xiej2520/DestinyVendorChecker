import { useContext } from "react";
import {
  StoreActionType,
  StoreContext,
  setCurrentVendor,
  incrementPendingRequests,
  decrementPendingRequests,
} from "../store";
import { getVendor } from "../store/api";
import {
  Character,
  VendorName,
  characters,
  vendorHashes,
} from "../store/api/definitions";

export default function AppBar() {
  const { state: store, dispatch: storeDispatch } = useContext(StoreContext);

  async function loadVendor(vendorName: VendorName, character: Character) {
    try {
      if (store.vendors[character][vendorName] == null) {
        incrementPendingRequests(storeDispatch);
        const vendorResponse = await getVendor(vendorName, character);
        storeDispatch({
          type: StoreActionType.LOAD_VENDOR,
          payload: {
            name: vendorResponse.vendorName,
            character,
            items: vendorResponse.saleItemCategories,
          },
        });
        decrementPendingRequests(storeDispatch);
      }
      setCurrentVendor(storeDispatch, vendorName);
    } catch (err) {
      console.log(err);
      decrementPendingRequests(storeDispatch);
      alert("Failed to retrieve vendor data!");
    }
  }

  function loadAllVendors() {
    //for (const character of characters) {
    const character = store.currentCharacter;
    for (const vendorName in vendorHashes) {
      try {
        incrementPendingRequests(storeDispatch);
        getVendor(vendorName as VendorName, character as Character).then(
          (vendorResponse) => {
            storeDispatch({
              type: StoreActionType.LOAD_VENDOR,
              payload: {
                name: vendorResponse.vendorName,
                character: character as Character,
                items: vendorResponse.saleItemCategories,
              },
            });
            decrementPendingRequests(storeDispatch);
          }
        );
      } catch (err) {
        console.log(err);
        decrementPendingRequests(storeDispatch);
      }
    }
  }

  function setCurrentCharacter(character: Character) {
    storeDispatch({
      type: StoreActionType.SET_CURRENT_CHARACTER,
      payload: {
        character,
      },
    });
  }

  return (
    <div className="w-full navbar bg-base-100">
      <button className="btn btn-square btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block w-5 h-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      <div>
        {Object.keys(vendorHashes).map((vendorName) => (
          <button
            key={vendorName}
            onClick={() =>
              loadVendor(vendorName as VendorName, store.currentCharacter)
            }
            className={`mx-0.5 btn btn-accent ${
              store.currentVendor == vendorName ? "" : "btn-outline"
            }`}
          >
            {vendorName}
          </button>
        ))}
      </div>
      <div className="ml-auto">
        <div className="flex">
          {characters.map((character) => (
            <button
              onClick={() => setCurrentCharacter(character)}
              className={`mx-0.5 btn btn-primary ${
                store.currentCharacter == character ? "" : "btn-outline"
              }`}
            >
              {character}
            </button>
          ))}
        </div>
        <div className="w-16">
          {store.pendingRequests > 0 ? (
            <span className="loading loading-spinner text-info"></span>
          ) : (
            <button
              onClick={loadAllVendors}
              className={"btn btn-accent btn-outline"}
            >
              Load All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
