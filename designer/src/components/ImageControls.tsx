import { observer } from "mobx-react-lite";
import React from "react";
import { usePoster } from "../util/hooks";

import svgMoveLeft from "../img/move-left.svg";
import svgMoveRight from "../img/move-right.svg";
import svgMoveUp from "../img/move-up.svg";
import svgMoveDown from "../img/move-down.svg";

import svgAlignVertical from "../img/align-v.svg";
import svgAlignHorizontal from "../img/align-h.svg";
import svgAlignLeft from "../img/align-left.svg";
import svgAlignRight from "../img/align-right.svg";
import svgAlignTop from "../img/align-top.svg";
import svgAlignBottom from "../img/align-bottom.svg";

const Settings = observer(() => {
  const poster = usePoster();

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

  function moveLeft() {
    poster.image.moveLeft();
  }
  function moveRight() {
    poster.image.moveRight();
  }
  function moveUp() {
    poster.image.moveUp();
  }
  function moveDown() {
    poster.image.moveDown();
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
      
      <label>Move</label>
      <div className="flex flex-row gap-1">
        <MoveButton onClick={moveLeft}>
            <SvgMoveIcon src={svgMoveLeft} />
        </MoveButton>
        <MoveButton onClick={moveRight}>
            <SvgMoveIcon src={svgMoveRight} />
        </MoveButton>
        <MoveButton onClick={moveUp}>
            <SvgMoveIcon src={svgMoveUp} />
        </MoveButton>
        <MoveButton onClick={moveDown}>
            <SvgMoveIcon src={svgMoveDown} />
        </MoveButton>
      </div>

      <label>Align</label>
      <div className="flex flex-row gap-1">
        <MoveButton onClick={centerVertical}>
            <SvgAlignIconBold src={svgAlignVertical} />
        </MoveButton>
        <MoveButton onClick={centerHorizontal}>
            <SvgAlignIconBold src={svgAlignHorizontal} />
        </MoveButton>
        <MoveButton onClick={alignLeft}>
            <SvgAlignIcon src={svgAlignLeft} />
        </MoveButton>
        <MoveButton onClick={alignRight}>
            <SvgAlignIcon src={svgAlignRight} />
        </MoveButton>
        <MoveButton onClick={alignTop}>
            <SvgAlignIcon src={svgAlignTop} />
        </MoveButton>
        <MoveButton onClick={alignBottom}>
            <SvgAlignIcon src={svgAlignBottom} />
        </MoveButton>
      </div>
    </div>
  );
});

function SvgAlignIconBold({src}: ISvgIconProps) {
  return (
    <div className="flex items-center justify-center">
      <img src={src} alt="" className="w-6 h-6" />
    </div>
  );
}

function SvgAlignIcon({src}: ISvgIconProps) {
  return (
    <div className="flex items-center justify-center">
      <img src={src} alt="" className="w-5 h-5" />
    </div>
  );
}

function SvgMoveIcon({src}: ISvgIconProps) {
  return (
    <div className="flex items-center justify-center">
      <img src={src} alt="" className="w-4 h-4" />
    </div>
  );
}

interface ISvgIconProps {
  src: string;
}

function MoveButton(props: IButtonProps) {
  return (
    <button
      className="text-3xl text-center w-10 h-10 border-2 rounded-md"
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
