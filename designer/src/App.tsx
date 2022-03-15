import Canvas from "./components/Canvas";
import Settings from "./components/Settings";
import { PosterContext, SettingsContext } from "./util/Context";
import "./App.css";
import { useEffect } from "react";
import LoadingPosterModal from "./components/LoadingPosterModal";
import { usePoster } from "./util/hooks";

function App() {
  const poster = usePoster();

  useEffect(() => {
    poster.readSettingsFromUrl();
  }, [poster]);

  return (
    <>
      <div className="app p-2 bg-charcoal text-white">
        <PosterContext.Provider value={poster}>
          <SettingsContext.Provider value={poster.settings}>
            <Canvas></Canvas>
            <Settings></Settings>
          </SettingsContext.Provider>
          <LoadingPosterModal />
        </PosterContext.Provider>
      </div>
    </>
  );
}

export default App;
