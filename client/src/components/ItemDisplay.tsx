import { useContext } from "react";

import { StoreContext } from "../store";
import ItemCard from "./ItemCard";
import { SaleItemCategory } from "../store/api/definitions";

export default function ItemDisplay() {
  const { state: store } = useContext(StoreContext);

  function getCategoryName(displayCategoryIndex: number) {
    //return displayCategoryIndex;
    return "";
  }
  function categoryComp(a: SaleItemCategory, b: SaleItemCategory) {
    const getRank = (categoryIndex: number) => {
      switch (store.currentVendor) {
        case "Saint-14":
          switch (categoryIndex) {
            case 3:
              return 0;
          }
          break;
        case "Banshee-44":
          switch (categoryIndex) {
            case 10:
              return 0; // Featured (Daily rotation)
            case 5:
              return 1; // Weapons (Weekly rotation)
            case 3:
              return 2; // Bounties
            case 8:
              return 3; // Material Exchange
            case 1:
              return 4; // Rank rewards
            case 2:
              return 5; // Gunsmith
          }
          break;
        case "Ada-1":
          switch (categoryIndex) {
            case 2:
              return 0; // Material Exchange (Shaders)
            case 3:
              return 1; // Armor
            case 0:
              return 2; // Bounties
          }
          break;
        case "Xur":
          switch (categoryIndex) {
            case 0:
              return 0; // Exotic Gear
            case 2:
              return 1; // Legendary Weapons
            case 3:
              return 2; // Legendary Armor
            case 4:
              return 3; // Exotic Weapons
            case 6:
              return 4; // Xenology
            case 7:
              return 5; // Xenology (again)
          }
          break;
      }
      return 1000;
    };
    return getRank(a.displayCategoryIndex) - getRank(b.displayCategoryIndex);
  }

  const sales =
    store.currentVendor == null
      ? null
      : store.vendors[store.currentCharacter][store.currentVendor];

  let saleDisplay;
  if (sales == null) {
    saleDisplay = <></>;
  } else if (sales.length === 0) {
    saleDisplay = <div>Could not load sales for {store.currentVendor}</div>;
  } else {
    saleDisplay = (
      <>
        {sales
          .slice()
          .sort(categoryComp)
          .map((category) => (
            <div
              key={category.displayCategoryIndex}
              className="flex flex-row flex-wrap w-full"
            >
              <p>{getCategoryName(category.displayCategoryIndex)}</p>
              <>
                {category.items.map((item) => (
                  <ItemCard item={item}></ItemCard>
                ))}
              </>
            </div>
          ))}
      </>
    );
    /*
        saleDisplay = (
      <div className="flex flex-row flex-wrap w-full">
        {sales.map(category => 
              <>
              {category.items.map((item) => (
                <ItemCard item={item}></ItemCard>
              ))}
              </>
        )}
      </div>
    );
    */
  }

  return (
    <>
      <h2 className="text-2xl font-bold my-2">{store.currentVendor ?? ""}</h2>
      <div className="">{saleDisplay}</div>
    </>
  );
}
