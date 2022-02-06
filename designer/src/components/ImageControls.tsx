import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { PosterContext } from "../util/Context";

const Settings = observer(() => {
  const poster = useContext(PosterContext);

  function fitToBorders() {
    poster.image.fitImageToBorders();
  }
  function fillBorders() {
    poster.image.fillBorders();
  }

  function centerVertical() {
    poster.image.centerImageVertical();
  }
  function centerHorizontal() {
    poster.image.centerImageHorizontal();
  }

  function alignLeft() {
    poster.image.alignLeft();
  }
  function alignTop() {
    poster.image.alignTop();
  }
  function alignRight() {
    poster.image.alignRight();
  }
  function alignBottom() {
    poster.image.alignBottom();
  }

  return (
    <div>
      <div className="flex flex-row gap-1">
        <ScaleButton onClick={fitToBorders}>
          <span className="underline">Fit</span> To Borders
        </ScaleButton>
        <ScaleButton onClick={fillBorders}>
          <span className="underline">Fill</span> Borders
        </ScaleButton>
      </div>
      <label>Align</label>
      <div className="flex flex-row gap-1">
        <MoveButton onClick={centerVertical}>
          <div className="text-center -mt-2">⧮</div>
        </MoveButton>
        <MoveButton onClick={centerHorizontal}>
          <div className="rotate-90 text-center ml-2">⧮</div>
        </MoveButton>
        <MoveButton onClick={alignLeft}>⇤</MoveButton>
        <MoveButton onClick={alignRight}>⇥</MoveButton>
        <MoveButton onClick={alignTop}>⤒</MoveButton>
        <MoveButton onClick={alignBottom}>⤓</MoveButton>
      </div>
    </div>
  );
});

function MoveButton(props: IButtonProps) {
  return (
    <button
      className="text-3xl text-center w-11 h-11 border-2 rounded-md"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function ScaleButton(props: IButtonProps) {
  return (
    <button
      className="w-full p-2 border-2 rounded transition font-bold bg-gray-100 hover:bg-slate-200 drop-shadow-sm cursor-pointer text-center"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

interface IButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default Settings;
