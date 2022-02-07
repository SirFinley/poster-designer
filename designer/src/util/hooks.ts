import { useContext } from "react";
import { PosterContext } from "./Context";

export const usePoster = () => useContext(PosterContext);