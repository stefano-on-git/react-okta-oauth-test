import { GlobalStore } from "./interfaces/Store";

export interface Props {
  store: GlobalStore;
  setStore: React.Dispatch<React.SetStateAction<GlobalStore>>;
  children?: JSX.Element;
}

export default function Level1(props: Props) {
  return (
    <div className="level1">
      <h3>Level 1</h3>
      <div
        style={{
          padding: 10,
          margin: 10,
          backgroundColor: "#eee"
        }}
      >
        count lvl1: <b>{props.store.level1.countLvl1}</b>
      </div>
      <button
        onClick={() => {
          props.setStore({
            ...props.store,
            level2: {
              countLvl2: ++props.store.level2.countLvl2
            }
          });
        }}
      >
        Update count level 2
      </button>
      {props.children}
    </div>
  );
}
