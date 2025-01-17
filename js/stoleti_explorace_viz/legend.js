import * as d3 from "d3";
import orderBy from "lodash/orderBy";

import * as axes from "./axes";
import * as colors from "./colors";
import * as lines from "./lines";
import * as texts from "./texts";
import * as tooltip from "./tooltip";

export const showLegendOnSide = (viz) => {
  return viz.width >= 738;
};

export const fadeInLegend = (viz, { exploreCategoryNames }) => {
  if (showLegendOnSide(viz)) {
    fadeInLegendOnSide(viz, { exploreCategoryNames });
  } else {
    fadeInLegendDropdown(viz, { exploreCategoryNames });
  }
};

export const fadeInLegendOnSide = (viz, { exploreCategoryNames }) => {
  const vizContainerEl = viz.svg.node().parentNode;

  const legendContainerEl = document.createElement("div");
  legendContainerEl.classList.add("priciny-umrti-pribehy-viz-legend");
  legendContainerEl.classList.add("stoleti-explorace-viz-legend");
  legendContainerEl.classList.add("legend-on-side");
  legendContainerEl.style.maxHeight = `${viz.height - 50}px`;
  vizContainerEl.append(legendContainerEl);

  const scrollContainerEl = document.createElement("div");
  scrollContainerEl.classList.add("legend-scroll-container");
  legendContainerEl.append(scrollContainerEl);

  const { handleLegendItemCheckboxChange } = renderInsidesOfScrollContainer(
    viz,
    {
      exploreCategoryNames,
      scrollContainerEl,
    }
  );

  window.setTimeout(() => {
    legendContainerEl.classList.add("legend-show");
    handleLegendItemCheckboxChange();
  }, 0);
};

export const fadeOutLegend = (viz) => {
  if (showLegendOnSide(viz)) {
    fadeOutLegendOnSide(viz);
  } else {
    fadeOutLegendDropdown(viz);
  }
};

export const fadeOutLegendOnSide = (viz) => {
  const vizContainerEl = viz.svg.node().parentNode;

  const legendContainerEl = vizContainerEl.querySelector(
    ".priciny-umrti-pribehy-viz-legend"
  );
  legendContainerEl.classList.remove("legend-show");

  window.setTimeout(() => {
    legendContainerEl.remove();
  }, 700);
};

const fadeInLegendDropdown = (viz, { exploreCategoryNames }) => {
  const vizContainerEl = viz.svg.node().parentNode;

  const legendContainerEl = document.createElement("div");
  legendContainerEl.classList.add("priciny-umrti-pribehy-viz-legend");
  legendContainerEl.classList.add("stoleti-explorace-viz-legend");
  legendContainerEl.classList.add("legend-dropdown");
  vizContainerEl.append(legendContainerEl);

  legendContainerEl.innerHTML = `
    <button type="button" class="legend-dropdown-button">
      <div class="legend-dropdown-button-count"></div>
      <div class="legend-dropdown-button-categories"></div>
    </button>
    <div class="legend-dropdown-menu">
      <div class="legend-scroll-container"></div>
    </div>
  `;

  const dropdownButtonEl = legendContainerEl.querySelector(
    ".legend-dropdown-button"
  );

  dropdownButtonEl.addEventListener("click", () => {
    if (legendContainerEl.classList.contains("open")) {
      legendContainerEl.classList.remove("open");
    } else {
      legendContainerEl.classList.add("open");
    }
  });

  const buttonCountEl = legendContainerEl.querySelector(
    ".legend-dropdown-button-count"
  );
  const buttonCategoriesEl = legendContainerEl.querySelector(
    ".legend-dropdown-button-categories"
  );

  const onShowCategoriesChange = (showCategoryNames) => {
    if (showCategoryNames.length === 0) {
      buttonCountEl.textContent = `Aktivních 0 z 24 skupin`;
    } else if (showCategoryNames.length > 0 && showCategoryNames.length < 5) {
      buttonCountEl.textContent = `Aktivní ${showCategoryNames.length} z 24 skupin`;
    } else if (showCategoryNames.length >= 5) {
      buttonCountEl.textContent = `Aktivních ${showCategoryNames.length} z 24 skupin`;
    }

    buttonCategoriesEl.innerHTML = "";

    showCategoryNames.map((categoryName) => {
      buttonCategoriesEl.innerHTML += `
        <span class="legend-dropdown-button-category">
          ${texts.categoriesShortLabels[categoryName]}
          <span class="legend-dropdown-button-category-color" style="background-color: ${colors.categoryColorsActive[categoryName]};"></span>
        </span>
      `;
    });
  };

  const scrollContainerEl = legendContainerEl.querySelector(
    ".legend-scroll-container"
  );

  const { handleLegendItemCheckboxChange } = renderInsidesOfScrollContainer(
    viz,
    {
      exploreCategoryNames,
      scrollContainerEl,
      onShowCategoriesChange,
    }
  );

  window.setTimeout(() => {
    legendContainerEl.classList.add("legend-show");
    handleLegendItemCheckboxChange();
  }, 0);
};

export const fadeOutLegendDropdown = (viz) => {
  const vizContainerEl = viz.svg.node().parentNode;

  const legendContainerEl = vizContainerEl.querySelector(
    ".priciny-umrti-pribehy-viz-legend"
  );
  legendContainerEl.classList.remove("legend-show");

  window.setTimeout(() => {
    legendContainerEl.remove();
  }, 700);
};

export const isAddedLegend = (viz) => {
  const vizContainerEl = viz.svg.node().parentNode;

  return !!vizContainerEl.querySelector(".priciny-umrti-pribehy-viz-legend");
};

export const removeLegend = (viz) => {
  const vizContainerEl = viz.svg.node().parentNode;

  const legendContainerEl = vizContainerEl.querySelector(
    ".priciny-umrti-pribehy-viz-legend"
  );
  legendContainerEl.remove();
};

const renderInsidesOfScrollContainer = (
  viz,
  { exploreCategoryNames, scrollContainerEl, onShowCategoriesChange = () => {} }
) => {
  const categoriesGroups = getCategoriesGroupsSortedByRightmostValueInGraph(
    viz.dataMzStd
  );

  let legendItemTouched = false;
  let legendItemTouchedTimeout = null;

  const handleLegendItemMouseover = (mouseoverCategoryName) => {
    if (legendItemTouched) {
      return;
    }

    if (
      !lines.isAddedCategoryLine(viz, { categoryName: mouseoverCategoryName })
    ) {
      return;
    }

    const dataMzStdDisplayed = viz.dataMzStd.filter(
      (category) =>
        category.skupina !== "Celkem" &&
        lines.isAddedCategoryLine(viz, { categoryName: category.skupina })
    );

    dataMzStdDisplayed.forEach((category) => {
      const categoryName = category.skupina;

      lines.changeCategoryLineStyle(viz, {
        categoryName,
        style: categoryName === mouseoverCategoryName ? "active" : "context",
        activeColor: colors.categoryColorsActive[categoryName],
      });

      tooltip.changeCategoryLineTooltipTriggersStyle(viz, {
        categoryName,
        style: categoryName === mouseoverCategoryName ? "active" : "context",
      });
    });

    lines.bringCategoryLineToFront({
      svg: viz.svg,
      categoryName: mouseoverCategoryName,
    });
  };

  const handleLegendItemMouseout = () => {
    const dataMzStdDisplayed = viz.dataMzStd.filter(
      (category) =>
        category.skupina !== "Celkem" &&
        lines.isAddedCategoryLine(viz, { categoryName: category.skupina })
    );

    dataMzStdDisplayed.forEach((category) => {
      const categoryName = category.skupina;

      lines.changeCategoryLineStyle(viz, {
        categoryName,
        style: "active",
        activeColor: colors.categoryColorsActive[categoryName],
      });

      tooltip.changeCategoryLineTooltipTriggersStyle(viz, {
        categoryName,
        style: "active",
      });
    });
  };

  const handleLegendItemTouchstart = () => {
    legendItemTouched = true;

    if (legendItemTouchedTimeout !== null) {
      window.clearTimeout(legendItemTouchedTimeout);
    }

    legendItemTouchedTimeout = window.setTimeout(() => {
      legendItemTouched = false;
      legendItemTouchedTimeout = null;
    }, 1000);
  };

  const handleLegendItemCheckboxChange = () => {
    const checkboxEls = scrollContainerEl.querySelectorAll(
      "input[type=checkbox]"
    );

    const showCategoryNames = [];
    checkboxEls.forEach((checkboxEl) => {
      if (checkboxEl.checked) {
        showCategoryNames.push(checkboxEl.dataset.categoryName);
      }
    });

    // Prep custom scale and line function

    const dataMzStdShow = viz.dataMzStd.filter((category) =>
      showCategoryNames.includes(category.skupina)
    );

    const yCustom = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          dataMzStdShow.map((category) =>
            d3.max(category.data.map((d) => d.value))
          )
        ),
      ])
      .nice()
      .range([viz.height - viz.marginExplore.bottom, viz.marginExplore.top]);

    const lineCustom = d3
      .line()
      .x((d) => viz.xExplore(d3.timeParse("%Y")(d.rok)))
      .y((d) => yCustom(d.value ? d.value : 0));

    // Update Y axis according to shown lines

    axes.updateYAxis(viz, { y: yCustom, margin: viz.marginExplore });

    // Add or remove respective lines

    const dataMzStdWithoutTotal = viz.dataMzStd.filter(
      (category) => category.skupina !== "Celkem"
    );

    dataMzStdWithoutTotal.forEach((category) => {
      const categoryName = category.skupina;
      const activeColor = colors.categoryColorsActive[categoryName];
      const show = showCategoryNames.includes(categoryName);
      const isAdded = lines.isAddedCategoryLine(viz, { categoryName });

      if (show && !isAdded) {
        lines.addCategoryLine({
          svg: viz.svg,
          categoryName,
          d: lineCustom(category.data),
          style: "active",
          activeColor,
        });

        tooltip.updateCategoryLineTooltipTriggers(viz, {
          categoryName,
          x: viz.xExplore,
          y: yCustom,
          activeColor,
        });
      } else if (show && isAdded) {
        lines.changeCategoryLine({
          svg: viz.svg,
          categoryName,
          d: lineCustom(category.data),
          style: "active",
          activeColor,
          duration: 700,
        });

        tooltip.updateCategoryLineTooltipTriggers(viz, {
          categoryName,
          x: viz.xExplore,
          y: yCustom,
          activeColor,
          duration: 700,
        });
      } else if (!show && isAdded) {
        lines.removeCategoryLine({
          svg: viz.svg,
          categoryName,
        });

        tooltip.removeCategoryLineTooltipTriggers(viz, { categoryName });
      }
    });

    Object.keys(categoriesGroups).forEach((groupName, index) => {
      const categoryShortLabels = categoriesGroups[groupName];
      const categoryNames = categoryShortLabels.map(
        (categoryShortLabel) =>
          texts.categoriesShortLabelsInverted[categoryShortLabel]
      );

      let allChecked = true;
      let allUnchecked = true;

      const inputEls = scrollContainerEl.querySelectorAll(
        "input[type=checkbox]"
      );
      inputEls.forEach((inputEl) => {
        if (categoryNames.includes(inputEl.dataset.categoryName)) {
          if (inputEl.checked) {
            allUnchecked = false;
          } else {
            allChecked = false;
          }
        }
      });

      let groupContainerEl = null;
      scrollContainerEl.querySelectorAll(".group-container").forEach((el) => {
        if (el.dataset.groupName === groupName) {
          groupContainerEl = el;
        }
      });

      const groupCheckEl = groupContainerEl.querySelector(".check-all");
      const groupUncheckEl = groupContainerEl.querySelector(".uncheck-all");

      groupCheckEl.classList.add("group-action-show");
      groupUncheckEl.classList.add("group-action-show");

      allChecked && groupCheckEl.classList.remove("group-action-show");
      allUnchecked && groupUncheckEl.classList.remove("group-action-show");
    });

    onShowCategoriesChange(showCategoryNames);
  };

  const handleGroupActionClick = (groupName, action) => {
    const categoryShortLabels = categoriesGroups[groupName];
    const categoryNames = categoryShortLabels.map(
      (categoryShortLabel) =>
        texts.categoriesShortLabelsInverted[categoryShortLabel]
    );

    const inputEls = scrollContainerEl.querySelectorAll("input[type=checkbox]");
    inputEls.forEach((inputEl) => {
      if (categoryNames.includes(inputEl.dataset.categoryName)) {
        inputEl.checked = action === "check-all" ? true : false;
      }
    });

    handleLegendItemCheckboxChange();
  };

  Object.keys(categoriesGroups).forEach((groupName, index) => {
    const categoryShortLabels = categoriesGroups[groupName];

    const groupContainerEl = document.createElement("div");
    groupContainerEl.classList.add("group-container");
    groupContainerEl.dataset.groupName = groupName;
    scrollContainerEl.append(groupContainerEl);

    const groupTitleEl = document.createElement("div");
    groupTitleEl.classList.add("group-title");
    index === 0 && groupTitleEl.classList.add("group-title-first");
    groupTitleEl.textContent = groupName;
    groupContainerEl.append(groupTitleEl);

    const groupActionsEl = document.createElement("div");
    groupActionsEl.classList.add("group-actions");
    groupContainerEl.append(groupActionsEl);

    const groupCheckEl = document.createElement("button");
    groupCheckEl.type = "button";
    groupCheckEl.classList.add("check-all");
    groupCheckEl.textContent = "zaškrtnout vše";
    groupCheckEl.addEventListener("click", () =>
      handleGroupActionClick(groupName, "check-all")
    );
    groupActionsEl.append(groupCheckEl);

    const groupUncheckEl = document.createElement("button");
    groupUncheckEl.type = "button";
    groupUncheckEl.classList.add("uncheck-all");
    groupUncheckEl.textContent = "odškrtnout vše";
    groupUncheckEl.addEventListener("click", () =>
      handleGroupActionClick(groupName, "uncheck-all")
    );
    groupActionsEl.append(groupUncheckEl);

    categoryShortLabels.forEach((categoryShortLabel) => {
      const categoryName =
        texts.categoriesShortLabelsInverted[categoryShortLabel];

      const labelEl = document.createElement("label");
      labelEl.classList.add("legend-item");

      // Add mouseover/out with delay so they do not screw up the animation
      window.setTimeout(() => {
        labelEl.addEventListener("mouseover", () =>
          handleLegendItemMouseover(categoryName)
        );
        labelEl.addEventListener("mouseout", () => handleLegendItemMouseout());
        labelEl.addEventListener("touchstart", handleLegendItemTouchstart);
      }, 1400);

      groupContainerEl.append(labelEl);

      const checkboxEl = document.createElement("input");
      checkboxEl.setAttribute("type", "checkbox");
      checkboxEl.checked = exploreCategoryNames.includes(categoryName);
      checkboxEl.dataset.categoryName = categoryName;
      checkboxEl.addEventListener("change", () =>
        handleLegendItemCheckboxChange()
      );
      labelEl.append(checkboxEl);

      const customCheckboxEl = document.createElement("span");
      customCheckboxEl.classList.add("custom-checkbox");
      customCheckboxEl.setAttribute(
        "style",
        `color: ${colors.categoryColorsActive[categoryName]}`
      );
      labelEl.append(customCheckboxEl);

      const labelTextEl = document.createElement("span");
      labelTextEl.classList.add("label-text");
      labelTextEl.textContent = categoryShortLabel;
      labelEl.append(labelTextEl);
    });
  });

  return {
    handleLegendItemCheckboxChange,
  };
};

const categoriesGroupsUnsorted = {
  "Nejčastější přirozené příčiny": [
    "Infekční nemoci",
    "Novotvary",
    "Nemoci oběhové soustavy",
  ],
  "Méně časté přirozené příčiny": [
    "Nemoci žláz a výživy",
    "Nemoci krve",
    "Nemoci dýchací soustavy",
    "Nemoci trávicí soustavy",
    "Nemoci močopohlavní soustavy",
    "Těhotenství a porod",
    "Nemoci kůže",
    "Nemoci kostí a svalů",
    "Vývojové vady",
    "Novorozenecké nemoci",
    "Neurčité příčiny smrti",
    "Nemoci nervové soustavy",
    "Duševní nemoci",
    "Nemoci oka",
    "Nemoci ucha",
    "Komplikace zdravotní péče",
  ],
  "Násilí a nehody": [
    "Sebevraždy",
    "Napadení",
    "Dopravní nehody",
    "Úrazy mimo dopravu",
    "Popravy a války",
  ],
};

const getCategoriesGroupsSortedByRightmostValueInGraph = (dataMzStd) => {
  const categoriesRightmostValues = dataMzStd.map((category) => {
    return {
      categoryName: category.skupina,
      categoryShortLabel: texts.categoriesShortLabels[category.skupina],
      rightmostValue: category.data[category.data.length - 1].value,
    };
  });

  const categoryShortLabelsSortedByRightmostValues = orderBy(
    categoriesRightmostValues,
    ["rightmostValue"],
    ["desc"]
  ).map((category) => category.categoryShortLabel);

  let sorted = {};

  Object.keys(categoriesGroupsUnsorted).forEach((groupName) => {
    sorted[
      groupName
    ] = categoryShortLabelsSortedByRightmostValues.filter((shortLabel) =>
      categoriesGroupsUnsorted[groupName].includes(shortLabel)
    );
  });

  return sorted;
};
