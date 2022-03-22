import { Props } from "./Level1";

export default function Level2(props: Props) {
  return (
    <div className="level2">
      <h4>Level 2</h4>
      <div
        style={{
          padding: 10,
          margin: 10,
          backgroundColor: "#eee"
        }}
      >
        count lvl2: <b>{props.store.level2.countLvl2}</b>
      </div>
      <button
        onClick={() => {
          props.setStore({
            ...props.store,
            level1: {
              countLvl1: ++props.store.level1.countLvl1
            }
          });
        }}
      >
        Update count level 1
      </button>
    </div>
  );
}
