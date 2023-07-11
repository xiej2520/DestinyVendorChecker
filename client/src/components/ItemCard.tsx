import { ReactNode } from "react";
import {
  DisplaySocket,
  DisplaySocketCategory,
  DisplayStat,
  SaleItem,
  SocketItem,
} from "../store/api/definitions";

export default function ItemCard(props: { item: SaleItem }) {
  const { item } = props;

  function formatStatName(name: string) {
    switch (name) {
      case "Rounds Per Minute":
        return "RPM";
      case "Airborne Effectiveness":
        return "Airborne";
      default:
        return name;
    }
  }
  function statComp(a: DisplayStat, b: DisplayStat) {
    const toNumber = (name: string) => {
      switch (name) {
        case "Draw Time":
          return 0;
        case "Charge Time":
          return 0;
        case "Swing Speed":
          return 0;
        case "Rounds Per Minute":
          return 0;
        case "Impact":
          return 1;
        case "Blast Radius":
          return 1;
        case "Guard Efficiency":
          return 2;
        case "Velocity":
          return 2;
        case "Accuracy":
          return 2;
        case "Range":
          return 2;
        case "Guard Resistance":
          return 3;
        case "Shield Duration":
          return 3;
        case "Stability":
          return 3;
        case "Charge Rate":
          return 4;
        case "Handling":
          return 4;
        case "Reload Speed":
          return 5;
        case "Guard Endurance":
          return 5;
        case "Aim Assistance":
          return 6;
        case "Airborne Effectiveness":
          return 7;
        case "Zoom":
          return 8;
        case "Recoil Direction":
          return 9;
        case "Ammo Capacity":
          return 10;
        case "Magazine":
          return 10;

        case "Mobility":
          return 0;
        case "Resilience":
          return 1;
        case "Recovery":
          return 2;
        case "Discipline":
          return 3;
        case "Intellect":
          return 4;
        case "Strength":
          return 5;
        default:
          return 1000;
      }
    };
    return toNumber(a.name) - toNumber(b.name);
  }

  function getStatDisplay(
    itemType: SaleItem["category"],
    stat: DisplayStat
  ): ReactNode {
    const isBarStat = stat.value <= 100;
    if (isBarStat) {
      return (
        <>
          <td className="w-8 text-right">{stat.value}</td>
          <td>
            <div className="w-[8rem] h-4 ml-2 bg-slate-950">
              <div
                className="h-4 bg-white"
                style={{
                  width: `${
                    itemType == "Weapon" ? stat.value : stat.value * 2
                  }%`,
                }}
                // out of 100 for weapon stats, out of 50 for armor stats
              ></div>
            </div>
          </td>
        </>
      );
    }
    return (
      <td colSpan={2} className="w-6 h-4 ml-2 text-center">
        {stat.value}
      </td>
    );
  }

  const watermarkImage = (
    <div className="relative">
      {item.iconWatermark == null ? (
        <></>
      ) : (
        <img
          src={`https://www.bungie.net/${item.iconWatermark}`}
          className="absolute top-0 left-0"
        />
      )}
      <img src={`https://www.bungie.net/${item.icon}`} />
    </div>
  );
  
  let totalStat = null;
  if (item.category == "Armor" && item.stats != null) {
    let statTotal = 0;
    for (const stat of item.stats) {
      statTotal += stat.value;
    }
    totalStat = {name: "Total", description: "", value: statTotal};
  }

  const statTable =
    item.stats == null ? (
      <></>
    ) : (
      <table className="m-1 text-xs">
        {item.stats
          .sort(statComp)
          .concat(totalStat == null ? [] : [totalStat])
          .map((stat) => (
            <tr>
              <td
                className="w-32 text-right tooltip tooltip-info table-cell"
                data-tip={stat.description}
              >
                {formatStatName(stat.name)}
              </td>
              {getStatDisplay(item.category, stat)}
            </tr>
          ))}
      </table>
    );

  function filterSocketCategories(category: DisplaySocketCategory) {
    if (
      category.name == "ARMOR MODS" ||
      category.name == "ARMOR COSMETICS" ||
      category.name == "ARMOR TIER" ||
      category.name == "WEAPON COSMETICS"
    ) {
      return false;
    }
    return true;
  }

  function displaySocketEntry(
    socket: DisplaySocket,
    socketCategoryName: string
  ) {
    if (socket.initialItem == null && socket.reusableItems.length == 0) {
      return <></>;
    }
    if (
      socket.initialItem != null &&
      ((socket.initialItem.name == "" &&
        socket.initialItem.description == "") || // Armor perks?
        socket.initialItem.name == "Empty Mod Socket" ||
        socket.initialItem.name == "Empty Deepsight Socket" ||
        socket.initialItem.name == "Empty Memento Socket" ||
        socket.initialItem.name == "Empty Weapon Level Boost Socket" ||
        socket.initialItem.name == "Kill Tracker")
    ) {
      return <></>;
    }
    let socketItems: SocketItem[] = [];
    if (socket.initialItem != null) {
      socketItems.push(socket.initialItem);
      socketItems.push(...socket.reusableItems.slice(1));
    } else if (
      // bug where weapons with no masterwork show all masterworks?
      socket.reusableItems.length > 0 &&
      !socket.reusableItems[0].name.includes("Tier")
    ) {
      socketItems = socket.reusableItems;
    }

    let displayIcon = <></>;
    if (socketCategoryName == "INTRINSIC TRAITS") {
      displayIcon = (
        <>
          {socketItems.map((plug) => (
            <div className="w-full h-12 flex">
              <div
                className="w-12 h-12 before:whitespace-pre-wrap before:text-left before:content-[--tw-content:'line1_\a_line2'] tooltip tooltip-info block"
                data-tip={`${plug.name}
${plug.description}`}
              >
                <img src={`https://bungie.net${plug.icon}`} />
              </div>
              <div className="m-0.5 h-full">{plug.name}</div>
            </div>
          ))}
        </>
      );
    } else if (socketCategoryName == "WEAPON MODS") {
      displayIcon = (
        <div>
          {socketItems.map((plug) => (
            <div
              className="w-10 h-10 ml-0.25 border boder-gray before:whitespace-pre-wrap before:text-left before:content-[--tw-content:'line1_\a_line2'] tooltip tooltip-info block"
              data-tip={`${plug.name}
${plug.description}`}
            >
              <img src={`https://bungie.net${plug.icon}`} />
            </div>
          ))}
        </div>
      );
    } else {
      displayIcon = (
        <div>
          {socketItems.map((plug, index) => (
            <div
              className="w-10 h-10 m-0.5 before:whitespace-pre-wrap before:text-left before:content-[--tw-content:'line1_\a_line2'] tooltip tooltip-info block"
              data-tip={`${plug.name}
${plug.description}`}
            >
              <img
                className={`p-0.5 border border-white rounded-full ${
                  index == 0 ? "bg-[#4886b6]" : ""
                }`}
                src={`https://bungie.net${plug.icon}`}
              />
            </div>
          ))}
        </div>
      );
    }
    return displayIcon;
  }
  const sockets =
    item.sockets == null ? (
      <></>
    ) : (
      <div>
        {item.sockets.filter(filterSocketCategories).map((category) => (
          <div className="flex flex-row w-68 m-1">
            {category.socketEntries.map((entry) =>
              displaySocketEntry(entry, category.name)
            )}
          </div>
        ))}
      </div>
    );

  return (
    <div className="w-72 h-[32rem] m-1 p-2 bg-neutral border-2 border-white">
      <div className="flex flex-row w-72 h-96px items-center">
        {watermarkImage}
        <div className="w-[calc(95%-96px)] p-2">
          <h2 className="text-xl font-bold">{item.name}</h2>
          <h4 className="text-xs">{item.itemTypeDisplayName}</h4>
        </div>
      </div>
      <p>{item.description}</p>
      {statTable}
      {sockets}
    </div>
  );
}
