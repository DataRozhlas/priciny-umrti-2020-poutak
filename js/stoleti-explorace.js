import debounce from "lodash/debounce";

import { initViz } from "./stoleti_explorace_viz";

const stoletiExplorace = async () => {
  const data = await fetchData();

  let viz = initViz(".stoleti-explorace-viz", data);

  let windowInnerWidthBefore = window.innerWidth;
  let windowInnerHeightBefore = window.innerHeight;

  const reinitVizAfterResize = debounce((e) => {
    if (
      windowInnerWidthBefore !== window.innerWidth ||
      windowInnerHeightBefore < window.innerHeight
    ) {
      viz.destroy();

      viz = initViz(".stoleti-explorace-viz", data);

      windowInnerWidthBefore = window.innerWidth;
      windowInnerHeightBefore = window.innerHeight;
    }
  }, 200);

  window.addEventListener("resize", reinitVizAfterResize);
};

const fetchData = () => {
  return Promise.all([
    fetch(
      `https://data.irozhlas.cz/priciny-umrti-2020/data/long_mz_std.json`
    ).then((response) => {
      return !response.error ? response.json() : Promise.reject();
    }),
    fetch(
      `https://data.irozhlas.cz/priciny-umrti-2020/data/long_mz_abs.json`
    ).then((response) => {
      return !response.error ? response.json() : Promise.reject();
    }),
    fetch(
      `https://data.irozhlas.cz/priciny-umrti-2020/data/tooltip_long.json`
    ).then((response) => {
      return !response.error ? response.json() : Promise.reject();
    }),
  ]).then(([dataLongMzStd, dataLongMzAbs, dataTooltipLong]) => {
    return {
      dataMzStd: dataLongMzStd,
      dataMzAbs: dataLongMzAbs,
      dataTooltip: dataTooltipLong,
    };
  });
};

document.addEventListener("DOMContentLoaded", stoletiExplorace);
