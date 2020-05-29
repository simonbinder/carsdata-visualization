import React, { useState, useEffect } from "react";
import "./App.css";
import { VictoryChart, VictoryScatter, VictoryTooltip } from "victory";
import { readString } from "react-papaparse";
import raw from "raw.macro";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import Tooltip from "rc-tooltip";
const Handle = Slider.Handle;

function App() {
  const [scatterData, setScatterData] = useState([]);
  const [carsData, setCarsData] = useState([]);
  const [selectedXAxis, setSelectedXAxis] = useState("Verbrauch");
  const [selectedYAxis, setSelectedYAxis] = useState("Hubraum");
  const [constructionYear, setConstructionYear] = useState(70);

  useEffect(() => {
    const csvData = raw("./cars.csv");
    const data = readString(csvData, {
      header: true,
    });
    const filteredData = filterData(data.data);
    const yearData = filteredData.filter(
      (car) => parseInt(car.Baujahr, 10) === constructionYear
    );
    setCarsData(filteredData);
    setScatterData(getScatterData(yearData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const yearData = carsData.filter(
        (car) => parseInt(car.Baujahr, 10) === constructionYear
      );
      setScatterData(getScatterData(yearData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedXAxis, selectedYAxis]);

  useEffect(() => {
    if (carsData && carsData.length > 0) {
      const filteredData = carsData.filter(
        (car) => parseInt(car.Baujahr, 10) === constructionYear
      );
      setScatterData(getScatterData(filteredData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructionYear]);

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
        Hubraum: car.Hubraum
          ? !isNaN(car.Hubraum)
            ? parseInt(car.Hubraum, 10)
            : 0
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

  const getScatterData = (carsData) => {
    const colors = [
      "violet",
      "cornflowerblue",
      "gold",
      "orange",
      "turquoise",
      "tomato",
      "greenyellow",
    ];
    return [...Array(carsData ? carsData.length - 1 : 25).keys()].map(
      (index) => {
        const symbol = carsData ? calcSymbol(carsData[index].Herkunft) : "plus";
        return {
          x: carsData[index][selectedXAxis],
          y: carsData[index][selectedYAxis],
          size: carsData[index].PS / 50,
          data: carsData[index],
          symbol: symbol,
          fill: colors[Math.random(0, 6)],
          opacity: 0.6,
        };
      }
    );
  };

  return (
    <div className="App">
      <select
        value={selectedXAxis}
        onChange={(event) => setSelectedXAxis(event.target.value)}
      >
        <option value="Verbrauch">Verbrauch</option>
        <option value="Zylinder">Zylinder</option>
        <option value="Hubraum">Hubraum</option>
        <option value="Beschleunigung">Beschleunigung</option>
      </select>
      <select
        value={selectedYAxis}
        onChange={(event) => setSelectedYAxis(event.target.value)}
      >
        <option value="Verbrauch">Verbrauch</option>
        <option value="Zylinder">Zylinder</option>
        <option value="Hubraum">Hubraum</option>
        <option value="Beschleunigung">Beschleunigung</option>
      </select>
      <div className="chart-container">
        <VictoryChart animate={{ duration: 2000, easing: "bounce" }}>
          <VictoryScatter
            data={scatterData}
            labelComponent={<VictoryTooltip />}
            labels={({ datum }) => {
              return `Hersteller: ${datum.data.Hersteller}, Verbrauch: ${datum.data.Verbrauch}`;
            }}
            style={{
              data: {
                fill: ({ datum }) => datum.fill,
                opacity: ({ datum }) => datum.opacity,
              },
            }}
          />
        </VictoryChart>
      </div>
      <div className="slider">
        <Slider
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
  );
}

export default App;
