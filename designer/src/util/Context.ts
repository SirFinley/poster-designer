import { createContext } from "react";
import Poster from "../class/poster";


export const poster = new Poster();
export const PosterContext = createContext(poster);
export const SettingsContext = createContext(poster.settings);