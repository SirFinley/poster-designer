import { createContext } from "react";
import poster from "../class/poster";


export const PosterContext = createContext(poster);
export const SettingsContext = createContext(poster.settings);