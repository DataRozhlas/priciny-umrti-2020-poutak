import * as d3 from "d3";

import * as axes from "./axes";
import * as colors from "./colors";
import * as legend from "./legend";
import * as lines from "./lines";
import * as tooltip from "./tooltip";

export const initViz = (svgSelector, data) => {
  const svg = d3.select(svgSelector);

  const {
    width: stickyWidth,
    height: stickyHeight,
  } = svg.node().parentNode.getBoundingClientRect();

  const width = stickyWidth;
  const height = Math.min(stickyHeight, 1000);

  // Prepare the margins
  let margin = { top: 60, right: 30, bottom: 80, left: 50 };
  let marginExplore = { ...margin, right: margin.right + 255 }; // legend on the right
  if (!legend.showLegendOnSide({ width })) {
    margin = { top: 55, right: 20, bottom: 50, left: 40 };
    marginExplore = margin; // legend in dropdown in top right
  }

  svg.attr("viewBox", [0, 0, width, height]);

  const { dataMzStd, dataMzAbs, dataTooltip } = data;
  const dataMzStdWithoutTotal = dataMzStd.filter(
    (category) => category.skupina !== "Celkem"
  );

  // Prepare data functions

  const years = dataMzStd[0].data.map((d) => d3.timeParse("%Y")(d.rok));

  const xExplore = d3
    .scaleUtc()
    .domain(d3.extent(years))
    .range([marginExplore.left, width - marginExplore.right]);

  const yExplore = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(
        dataMzStdWithoutTotal.map((category) =>
          d3.max(category.data.map((d) => d.value))
        )
      ),
    ])
    .nice()
    .range([height - marginExplore.bottom, marginExplore.top]);

  // Line functions

  const lineExplore = d3
    .line()
    .x((d) => xExplore(d3.timeParse("%Y")(d.rok)))
    .y((d) => yExplore(d.value ? d.value : 0));

  // Put together viz object

  const viz = {
    svg,

    dataMzStd,

    tooltipData: tooltip.prepareTooltipData({ dataMzAbs, dataTooltip }),

    xExplore,
    yExplore,
    lineExplore,

    width,
    height,
    margin,
    marginExplore,
  };

  // Axes

  axes.updateXAxis(viz, { x: viz.xExplore, margin: viz.marginExplore });
  axes.updateYAxis(viz, { y: viz.yExplore, margin: viz.marginExplore });
  axes.createYAxisLabel(viz);

  // Lines

  lines.createLinesGroup(viz);

  // Line labels

  lines.createLineLabelsGroup(viz);

  // Tooltip

  tooltip.createTooltipTriggersGroup(viz);

  // Legend

  legend.fadeInLegend(viz, {
    exploreCategoryNames: viz.dataMzStd
      .filter((category) => category.skupina !== "Celkem")
      .map((category) => category.skupina),
  });

  return {
    destroy: () => {
      viz.svg.selectAll("*").remove();

      if (legend.isAddedLegend(viz)) {
        legend.removeLegend(viz);
      }

      tooltip.hideTooltip();
    },
  };
};
