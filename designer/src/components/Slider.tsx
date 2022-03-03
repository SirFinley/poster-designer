import "./Slider.css";
export default function Slider(props: Props) {
  return (
    <input
      className="w-full"
      type="range"
      min={props.min}
      max={props.max}
      value={props.value}
      step={props.step}
      onChange={(e) => props.onChange(parseFloat(e.target.value))}
      disabled={!!props.disabled}
    />
  );
}

interface Props {
    disabled?: boolean,
    min: number,
    max: number,
    value: number,
    step: number,
    onChange: (value: number) => void,
}