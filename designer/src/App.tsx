import Canvas from "./components/Canvas";
import IntroModal from "./components/IntroModal";
import Settings from "./components/Settings";
import { poster, PosterContext, SettingsContext } from "./util/Context";
import "./App.css";

function App() {
  return (
    <>
      <IntroModal></IntroModal>
      <div className="app p-2">
        <PosterContext.Provider value={poster}>
          <SettingsContext.Provider value={poster.settings}>
            <Canvas></Canvas>
            <Settings></Settings>
          </SettingsContext.Provider>
        </PosterContext.Provider>
      </div>
    </>
  );
}

export default App;
