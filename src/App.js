import React, { useState, useEffect } from "react";
import "./App.css";
import {
  VictoryChart,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryLabel,
} from "victory";
import { readString } from "react-papaparse";
import raw from "raw.macro";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import Tooltip from "rc-tooltip";
import { CSS_COLOR_NAMES } from "./colorNames";
const Handle = Slider.Handle;

function App() {
  const [scatterData, setScatterData] = useState([]);
  const [carsData, setCarsData] = useState([]);
  const [selectedXAxis, setSelectedXAxis] = useState("Verbrauch");
  const [selectedYAxis, setSelectedYAxis] = useState("Hubraum");
  const [constructionYear, setConstructionYear] = useState([70, 70]);
  const [manufacturers, setManufacturers] = useState([]);
  const [checkedManufacturers, setCheckedManufacturers] = useState([]);

  useEffect(() => {
    const csvData = raw("./cars.csv");
    const data = readString(csvData, {
      header: true,
    });
    const filteredData = filterData(data.data);
    const yearData = filteredData.filter(
      (car) =>
        constructionYear[0] >= parseInt(car.Baujahr, 10) &&
        parseInt(car.Baujahr, 10) <= constructionYear[1]
    );
    const tempManufacturers = filteredData.map((car) => car.Hersteller);
    const uniqueManufacturs = Array.from(new Set(tempManufacturers));
    const manufacturerData = yearData.filter((car) =>
      uniqueManufacturs.includes(car.Hersteller)
    );
    setManufacturers(uniqueManufacturs);
    setCheckedManufacturers(uniqueManufacturs);
    setCarsData(filteredData);
    setScatterData(getScatterData(manufacturerData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const yearData = carsData.filter(
        (car) =>
          constructionYear[0] >= parseInt(car.Baujahr, 10) &&
          parseInt(car.Baujahr, 10) <= constructionYear[1]
      );
      setScatterData(getScatterData(yearData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedXAxis, selectedYAxis]);

  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const filteredData = carsData.filter(
        (car) =>
          parseInt(car.Baujahr, 10) >= constructionYear[0] &&
          parseInt(car.Baujahr, 10) <= constructionYear[1]
      );
      setScatterData(getScatterData(filteredData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructionYear]);

  useEffect(() => {
    if (carsData.length > 0) {
      const tempCarsData = JSON.parse(JSON.stringify(carsData));
      const filteredManufacturers = tempCarsData.filter((car) =>
        checkedManufacturers.includes(car.Hersteller)
      );
      const yearData = filteredManufacturers.filter(
        (car) =>
          constructionYear[0] >= parseInt(car.Baujahr, 10) &&
          parseInt(car.Baujahr, 10) <= constructionYear[1]
      );
      setScatterData(getScatterData(yearData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedManufacturers]);

  const filterData = (carsData) => {
    const correctedData = carsData.map((car) => {
      return {
        ...car,
        Verbrauch: car.Verbrauch
          ? Math.round(
              !isNaN(car.Verbrauch.replace(",", "."))
                ? parseInt(car.Verbrauch.replace(",", "."))
                : 0,
              2
            )
          : 0,
        PS: car.PS ? parseInt(car.PS, 10) : 0,
        Zylinder: car.Zylinder ? parseInt(car.Zylinder, 10) : 0,
        Beschleunigung: car.Beschleunigung
          ? parseInt(car.Beschleunigung, 10)
          : 0,
        Hubraum: car.Hubraum
          ? !isNaN(car.Hubraum)
            ? parseInt(car.Hubraum, 10)
            : 0
          : 0,
        Gewicht: car["Gewicht in kg"]
          ? Math.round(
              !isNaN(car["Gewicht in kg"].replace(",", "."))
                ? parseInt(car["Gewicht in kg"].replace(",", "."))
                : 0,
              2
            )
          : 0,
      };
    });
    return correctedData;
  };

  const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  };

  const calcSymbol = (origin) => {
    switch (origin) {
      case "American":
        return "circle";
      case "European":
        return "square";
      case "Japanese":
        return "star";
      default:
        break;
    }
  };

  const updateCheckbox = (event, manufacturer) => {
    let tempChecked = JSON.parse(JSON.stringify(checkedManufacturers));
    checkedManufacturers.includes(manufacturer)
      ? (tempChecked = tempChecked.filter((item) => item !== manufacturer))
      : tempChecked.push(manufacturer);
    setCheckedManufacturers(tempChecked);
  };

  const getScatterData = (carsData) => {
    return [...Array(carsData ? carsData.length - 1 : 25).keys()].map(
      (index) => {
        const colorIndex = manufacturers.findIndex(
          (manufacturer) => manufacturer === carsData[index].Hersteller
        );
        const symbol = carsData ? calcSymbol(carsData[index].Herkunft) : "plus";
        return {
          x: carsData[index][selectedXAxis],
          y: carsData[index][selectedYAxis],
          size: carsData[index].PS / 50,
          data: carsData[index],
          symbol: symbol,
          fill: CSS_COLOR_NAMES[colorIndex],
          label: `Modell: ${carsData[index].Model},
          Hersteller: ${carsData[index].Hersteller},
          Herkunft: ${carsData[index].Herkunft},
          Verbrauch: ${carsData[index].Verbrauch} l/100km,
          Beschleunigung: ${carsData[index].Beschleunigung} s
          Gewicht: ${carsData[index].Gewicht}kg,
          PS: ${carsData[index].PS}`,
        };
      }
    );
  };

  return (
    <div className="App">
      <div>
        <span>Y-Achse</span>
        <select
          value={selectedYAxis}
          onChange={(event) => setSelectedYAxis(event.target.value)}
        >
          <option value="Verbrauch">Verbrauch</option>
          <option value="Zylinder">Zylinder</option>
          <option value="Gewicht">Gewicht in kg</option>
          <option value="Hubraum">Hubraum</option>
          <option value="Beschleunigung">Beschleunigung</option>
        </select>
      </div>
      <div>
        <div className="chart-container">
          <VictoryChart
            containerComponent={<VictoryVoronoiContainer />}
            padding={{ left: 70, top: 50, bottom: 50, right: 50 }}
          >
            <VictoryAxis
              label={`${selectedYAxis}`}
              axisLabelComponent={<VictoryLabel dy={-12} />}
              dependentAxis
              style={{
                tickLabels: {
                  fontSize: 10,
                  padding: 5,
                  axisLabel: { fontSize: 15, padding: 30 },
                },
              }}
            />
            <VictoryScatter
              data={scatterData}
              labelComponent={
                <VictoryTooltip
                  constrainToVisibleArea
                  cornerRadius={5}
                  pointerLength={5}
                  flyoutStyle={{
                    stroke: "black",
                    fill: "white",
                    strokeWidth: 0.5,
                  }}
                  style={{
                    fontSize: 7,
                    padding: 0,
                    margin: 0,
                  }}
                />
              }
              labels={({ datum }) => {}}
              style={{
                data: {
                  fill: ({ datum }) => datum.fill,
                  opacity: ({ datum }) => datum.opacity,
                },
              }}
            />
            <VictoryAxis
              label={`${selectedXAxis}`}
              style={{
                tickLabels: {
                  fontSize: 10,
                  padding: 5,
                  axisLabel: { fontSize: 15, padding: 30 },
                },
              }}
            />
          </VictoryChart>
        </div>
        <div className={"ySelector"}>
          <span>X-Achse</span>
          <select
            value={selectedXAxis}
            onChange={(event) => setSelectedXAxis(event.target.value)}
          >
            <option value="Verbrauch">Verbrauch</option>
            <option value="Zylinder">Zylinder</option>
            <option value="Gewicht">Gewicht in kg</option>
            <option value="Hubraum">Hubraum</option>
            <option value="Beschleunigung">Beschleunigung</option>
          </select>
        </div>
      </div>
      <div>
        <div className={"manufacturers"}>
          {manufacturers &&
            manufacturers.map((car, index) => {
              const colorIndex = manufacturers.findIndex(
                (manufacturer) => manufacturer === car
              );
              return (
                <div key={index} className={"checkbox-elements"}>
                  <input
                    type="checkbox"
                    key={`manufacturer-${index}`}
                    name={car}
                    checked={checkedManufacturers.includes(car)}
                    onChange={(event) => updateCheckbox(event, car)}
                  />
                  <span>{car}</span>
                  <span
                    className={"dot"}
                    style={{ backgroundColor: CSS_COLOR_NAMES[colorIndex] }}
                  ></span>
                </div>
              );
            })}
        </div>
        <div className="slider">
          <Range
            min={70}
            max={82}
            defaultValue={70}
            dots
            value={constructionYear}
            onChange={setConstructionYear}
            handle={handle}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
